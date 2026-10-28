
const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true
        },

        studentId: {
            type: String
        },

        studentEmail: {
            type: String
        },

        courseId: {
            type: String
        },

        courseKey: {
            type: String
        },

        title: {
            type: String
        },

        course: {
            type: String
        },

        status: {
            type: String,
            default: "Enrolled"
        },

        completed: {
            type: Boolean,
            default: false
        },

        completionDate: {
            type: String
        }
    },
    {
        timestamps: true,
        strict: false
    }
);

enrollmentSchema.index({
    studentId: 1,
    courseId: 1
});

module.exports = mongoose.model(
    "Enrollment",
    enrollmentSchema,
    "enrollments"
);
