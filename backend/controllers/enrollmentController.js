
const mongoose = require("mongoose");
const crypto = require("node:crypto");

function col(name) {
  return mongoose.connection.db.collection(name);
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function withoutMongoId(record) {
  if (!record) return record;
  const { _id, ...rest } = record;
  return rest;
}

function matchesCourse(course, courseId) {
  return [
    course.id,
    course.courseKey,
    course.key
  ].some(value => normalize(value) === normalize(courseId));
}

function enrollmentMatches(enrollment, course) {
  const identifiers = [
    course.id,
    course.courseKey,
    course.key
  ].map(normalize);

  return [
    enrollment.courseId,
    enrollment.courseKey
  ].map(normalize).some(value => identifiers.includes(value));
}

async function getStudent(studentId) {
  return col("students").findOne({
    id: String(studentId)
  });
}

// POST /api/v1/enrollments
async function enrollCourse(req, res, next) {
  try {
    const studentId = String(req.user.id);
    const { courseId } = req.body || {};

    if (
      courseId === undefined ||
      courseId === null ||
      !String(courseId).trim()
    ) {
      return res.status(400).json({
        message: "Course ID is required"
      });
    }

    const student = await getStudent(studentId);

    if (!student || student.active === false) {
      return res.status(403).json({
        message: "Student account is unavailable"
      });
    }

    const courses = await col("courses").find().toArray();

    const course = courses.find(item =>
      matchesCourse(item, courseId)
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    const enrollments = await col("enrollments")
      .find({ studentId })
      .toArray();

    const alreadyEnrolled = enrollments.some(item =>
      enrollmentMatches(item, course)
    );

    if (alreadyEnrolled) {
      return res.status(409).json({
        message: "Already enrolled in this course"
      });
    }

    const enrollment = {
      id: crypto.randomUUID(),
      studentId,
      student: student.studentName,
      studentName: student.studentName,
      studentEmail: student.email,
      courseId: course.id,
      courseKey: course.courseKey || course.key || course.id,
      title: course.title,
      course: course.title,
      enrollDate: new Date().toLocaleDateString(),
      enrolledAt: new Date().toISOString(),
      status: "Pending",
      completed: false
    };

    await col("enrollments").insertOne(enrollment);

    return res.status(201).json({
      message: "Course enrollment successful",
      enrollment: withoutMongoId(enrollment)
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/enrollments/my-courses
async function getMyCourses(req, res, next) {
  try {
    const studentId = String(req.user.id);

    const student = await getStudent(studentId);

    if (!student || student.active === false) {
      return res.status(403).json({
        message: "Student account is unavailable"
      });
    }

    const [enrollments, courses] = await Promise.all([
      col("enrollments").find().toArray(),
      col("courses").find().toArray()
    ]);

    const myEnrollments = enrollments
      .filter(enrollment => {
        if (enrollment.studentId != null) {
          return String(enrollment.studentId) === studentId;
        }

        return Boolean(
          enrollment.studentEmail &&
          normalize(enrollment.studentEmail) ===
            normalize(student.email)
        );
      })
      .map(enrollment => {
        const course = courses.find(item =>
          enrollmentMatches(enrollment, item)
        );

        return {
          ...withoutMongoId(enrollment),
          courseDetails: course
            ? withoutMongoId(course)
            : null
        };
      });

    res.json({
      message: "Enrolled courses fetched successfully",
      totalEnrollments: myEnrollments.length,
      enrollments: myEnrollments
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/enrollments/:courseId
async function unenrollCourse(req, res, next) {
  try {
    const studentId = String(req.user.id);
    const { courseId } = req.params;

    const student = await getStudent(studentId);

    if (!student || student.active === false) {
      return res.status(403).json({
        message: "Student account is unavailable"
      });
    }

    const enrollments = await col("enrollments")
      .find()
      .toArray();

    const enrollment = enrollments.find(item => {
      const belongsToStudent =
        item.studentId != null
          ? String(item.studentId) === studentId
          : normalize(item.studentEmail) ===
            normalize(student.email);

      return belongsToStudent &&
        [item.courseId, item.courseKey]
          .some(value =>
            normalize(value) === normalize(courseId)
          );
    });

    if (!enrollment) {
      return res.status(404).json({
        message: "You are not enrolled in this course"
      });
    }

    if (
      enrollment.completed === true ||
      normalize(enrollment.status) === "completed"
    ) {
      return res.status(409).json({
        message: "Completed course enrollment cannot be removed"
      });
    }

    await col("enrollments").deleteOne({
      _id: enrollment._id
    });

    res.json({
      message: "Successfully unenrolled from course"
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  enrollCourse,
  getMyCourses,
  unenrollCourse
};
