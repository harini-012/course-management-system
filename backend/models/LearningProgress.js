
const mongoose = require("mongoose");

const learningProgressSchema = new mongoose.Schema(
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

        courseTitle: {
            type: String
        },

        completedVideos: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },

        totalVideos: {
            type: Number,
            default: 0
        },

        currentVideoIndex: {
            type: Number,
            default: 0
        },

        percentage: {
            type: Number,
            default: 0
        },

        completed: {
            type: Boolean,
            default: false
        },

        startedAt: {
            type: String
        },

        updatedAt: {
            type: String
        },

        completedAt: {
            type: String
        }
    },
    {
        strict: false,
        versionKey: false
    }
);

learningProgressSchema.index({
    studentId: 1,
    courseId: 1
});

module.exports = mongoose.model(
    "LearningProgress",
    learningProgressSchema,
    "progress"
);
