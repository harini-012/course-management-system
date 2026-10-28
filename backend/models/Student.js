
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        // Preserve existing JSON Server student IDs.
        id: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            trim: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            select: false
        },

        department: {
            type: String
        },

        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        strict: false
    }
);

studentSchema.index({ email: 1 });

module.exports = mongoose.model(
    "Student",
    studentSchema,
    "students"
);
