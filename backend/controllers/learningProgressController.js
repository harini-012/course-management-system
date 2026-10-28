
const mongoose = require("mongoose");
const crypto = require("node:crypto");

function col(name) {
  return mongoose.connection.db.collection(name);
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function clean(record) {
  if (!record) return record;
  const { _id, ...result } = record;
  return result;
}

function belongsToStudent(record, student) {
  if (
    record.studentId !== undefined &&
    record.studentId !== null
  ) {
    return String(record.studentId) === String(student.id);
  }

  return Boolean(
    record.studentEmail &&
    student.email &&
    normalize(record.studentEmail) === normalize(student.email)
  );
}

function findCourse(courses, enrollment) {
  const enrollmentIds = [
    enrollment.courseId,
    enrollment.courseKey
  ].filter(value => value != null).map(normalize);

  return courses.find(course => {
    const ids = [
      course.id,
      course.courseKey,
      course.key
    ].filter(value => value != null).map(normalize);

    return enrollmentIds.some(id => ids.includes(id));
  }) || null;
}

function matchesCourse(record, enrollment, course) {
  const ids = [
    enrollment.courseId,
    enrollment.courseKey,
    course?.id,
    course?.courseKey,
    course?.key
  ].filter(value => value != null).map(normalize);

  return [
    record.courseId,
    record.courseKey
  ]
    .filter(value => value != null)
    .map(normalize)
    .some(value => ids.includes(value));
}

function selectBestProgress(records) {
  if (!records.length) return null;

  const videoCount = record =>
    new Set(
      (Array.isArray(record.completedVideos)
        ? record.completedVideos
        : []).map(String)
    ).size;

  return [...records].sort((a, b) => {
    const countDiff = videoCount(b) - videoCount(a);

    if (countDiff !== 0) return countDiff;

    const percentDiff =
      Number(b.percentage || 0) -
      Number(a.percentage || 0);

    if (percentDiff !== 0) return percentDiff;

    const dateA = Date.parse(
      a.updatedAt || a.startedAt || ""
    ) || 0;

    const dateB = Date.parse(
      b.updatedAt || b.startedAt || ""
    ) || 0;

    return dateB - dateA;
  })[0];
}

async function loadData() {
  const [students, progress, courses, enrollments] =
    await Promise.all([
      col("students").find().toArray(),
      col("progress").find().toArray(),
      col("courses").find().toArray(),
      col("enrollments").find().toArray()
    ]);

  return { students, progress, courses, enrollments };
}

// GET /api/v1/progress/my-progress
async function getMyProgress(req, res, next) {
  try {
    const studentId = String(req.user.id);
    const data = await loadData();

    const student = data.students.find(
      item => String(item.id) === studentId
    );

    if (!student || student.active === false) {
      return res.status(403).json({
        success: false,
        message: "Student account unavailable"
      });
    }

    const myEnrollments = data.enrollments.filter(
      item => belongsToStudent(item, student)
    );

    const myProgress = data.progress.filter(
      item => belongsToStudent(item, student)
    );

    const uniqueCourses = new Map();

    for (const enrollment of myEnrollments) {
      if (normalize(enrollment.status) === "rejected") {
        continue;
      }

      const course = findCourse(
        data.courses,
        enrollment
      );

      const courseId =
        course?.id ??
        enrollment.courseId ??
        enrollment.courseKey;

      if (
        courseId === undefined ||
        courseId === null ||
        !String(courseId).trim()
      ) {
        continue;
      }

      const key = normalize(courseId);

      if (uniqueCourses.has(key)) {
        continue;
      }

      const matching = myProgress.filter(record =>
        matchesCourse(record, enrollment, course)
      );

      const savedProgress = selectBestProgress(matching);

      const completedVideos = [
        ...new Set(
          (
            Array.isArray(savedProgress?.completedVideos)
              ? savedProgress.completedVideos
              : []
          ).map(String)
        )
      ];

      const totalVideos = Array.isArray(course?.videos)
        ? course.videos.length
        : Math.max(
            0,
            Number(savedProgress?.totalVideos || 0)
          );

      const completedCount = completedVideos.length;

      const calculatedPercentage =
        totalVideos > 0
          ? Math.min(
              100,
              Math.round(
                completedCount / totalVideos * 100
              )
            )
          : 0;

      const completed =
        savedProgress?.completed === true ||
        normalize(enrollment.status) === "completed" ||
        enrollment.completed === true ||
        (
          totalVideos > 0 &&
          completedCount >= totalVideos
        );

      const percentage = completed
        ? 100
        : calculatedPercentage;

      const courseTitle =
        course?.title ||
        enrollment.courseTitle ||
        enrollment.title ||
        enrollment.course ||
        savedProgress?.courseTitle ||
        "Deleted Course";

      const result = {
        ...(savedProgress ? clean(savedProgress) : {}),

        studentId: student.id,
        studentEmail: student.email,
        courseId,
        courseKey:
          course?.courseKey ||
          course?.key ||
          enrollment.courseKey ||
          savedProgress?.courseKey ||
          courseId,
        courseTitle,

        completedVideos,
        totalVideos,
        completedLessons: completedCount,
        totalLessons: totalVideos,
        percentage,
        progressPercentage: percentage,
        completed,

        currentVideoIndex:
          savedProgress?.currentVideoIndex ?? 0,

        courseAvailable: Boolean(course),
        courseDetails: course ? clean(course) : null,
        enrollmentStatus: enrollment.status || "Pending",
        enrollmentId: enrollment.id,

        startedAt: savedProgress?.startedAt || null,
        updatedAt: savedProgress?.updatedAt || null,
        completedAt: savedProgress?.completedAt || null
      };

      uniqueCourses.set(key, result);
    }

    const result = [...uniqueCourses.values()];

    return res.status(200).json({
      success: true,
      message: "Learning progress fetched successfully",
      totalCourses: result.length,
      progress: result
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/progress
async function updateProgress(req, res, next) {
  try {
    const studentId = String(req.user.id);

    const {
      courseId,
      completedVideos,
      currentVideoIndex
    } = req.body || {};

    if (
      courseId === undefined ||
      courseId === null ||
      !String(courseId).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "courseId is required"
      });
    }

    if (!Array.isArray(completedVideos)) {
      return res.status(400).json({
        success: false,
        message: "completedVideos must be an array"
      });
    }

    const data = await loadData();

    const student = data.students.find(
      item => String(item.id) === studentId
    );

    if (!student || student.active === false) {
      return res.status(403).json({
        success: false,
        message: "Student account unavailable"
      });
    }

    const course = data.courses.find(item =>
      [
        item.id,
        item.courseKey,
        item.key
      ]
        .filter(value => value != null)
        .some(value =>
          normalize(value) === normalize(courseId)
        )
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or unavailable"
      });
    }

    const enrollment = data.enrollments.find(item =>
      belongsToStudent(item, student) &&
      matchesCourse(
        {
          courseId: item.courseId,
          courseKey: item.courseKey
        },
        {
          courseId: course.id,
          courseKey: course.courseKey || course.key
        },
        course
      )
    );

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course"
      });
    }

    const enrollmentStatus =
      normalize(enrollment.status);

    if (enrollmentStatus === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Enrollment has been rejected"
      });
    }

    const videos = Array.isArray(course.videos)
      ? course.videos
      : [];

    const validVideoIds = videos.map(
      (video, index) =>
        String(
          typeof video === "string"
            ? `video-${index + 1}`
            : video.id ||
              video.key ||
              `video-${index + 1}`
        )
    );

    const requestedIds = completedVideos.map(String);

    if (
      requestedIds.some(
        id => !validVideoIds.includes(id)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid completed video ID"
      });
    }

    const index =
      currentVideoIndex === undefined
        ? 0
        : Number(currentVideoIndex);

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      (videos.length > 0 && index >= videos.length) ||
      (videos.length === 0 && index !== 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid currentVideoIndex"
      });
    }

    const matchingProgress = data.progress.filter(
      item =>
        belongsToStudent(item, student) &&
        matchesCourse(item, enrollment, course)
    );

    const existingProgress =
      selectBestProgress(matchingProgress);

    const previousIds =
      Array.isArray(existingProgress?.completedVideos)
        ? existingProgress.completedVideos.map(String)
        : [];

    const mergedCompletedVideos = [
      ...new Set([
        ...previousIds.filter(id =>
          validVideoIds.includes(id)
        ),
        ...requestedIds
      ])
    ];

    const totalVideos = videos.length;

    const completed =
      totalVideos > 0 &&
      mergedCompletedVideos.length === totalVideos;

    const percentage =
      totalVideos > 0
        ? Math.round(
            mergedCompletedVideos.length /
            totalVideos * 100
          )
        : 0;

    const now = new Date().toISOString();

    const progressUpdate = {
      studentId: student.id,
      studentEmail: student.email,
      courseId: course.id,
      courseKey:
        course.courseKey ||
        course.key ||
        course.id,
      courseTitle: course.title,
      completedVideos: mergedCompletedVideos,
      totalVideos,
      currentVideoIndex: index,
      percentage,
      completed,
      updatedAt: now,
      completedAt: completed
        ? existingProgress?.completedAt || now
        : null
    };

    let savedProgress;
    let statusCode;

    if (existingProgress) {
      const updated = await col("progress")
        .findOneAndUpdate(
          { _id: existingProgress._id },
          { $set: progressUpdate },
          { returnDocument: "after" }
        );

      savedProgress = updated;
      statusCode = 200;
    } else {
      const created = {
        id: crypto.randomUUID(),
        ...progressUpdate,
        startedAt: now
      };

      await col("progress").insertOne(created);

      savedProgress = created;
      statusCode = 201;
    }

    // Keep enrollment completion synchronized.
    if (
      completed &&
      (
        enrollment.completed !== true ||
        enrollmentStatus !== "completed"
      )
    ) {
      await col("enrollments").updateOne(
        { _id: enrollment._id },
        {
          $set: {
            status: "Completed",
            completed: true,
            completionDate:
              enrollment.completionDate ||
              new Date().toLocaleDateString()
          }
        }
      );
    }

    return res.status(statusCode).json({
      success: true,
      message: completed
        ? "Course completed successfully"
        : "Learning progress updated successfully",
      progress: clean(savedProgress)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyProgress,
  updateProgress
};
