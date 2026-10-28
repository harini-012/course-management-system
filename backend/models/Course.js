
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true
        },

        courseKey: {
            type: String
        },

        key: {
            type: String
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String
        },

        videos: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },

        materials: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        }
    },
    {
        timestamps: true,
        strict: false
    }
);

module.exports = mongoose.model(
    "Course",
    courseSchema,
    "courses"
);
