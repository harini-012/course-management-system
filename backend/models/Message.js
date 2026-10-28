const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: String,
            required: true
        },

        recipient: {
            type: String,
            required: true
        },

        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        }
    },
    {
        timestamps: true
    }
);

messageSchema.index({
    sender: 1,
    recipient: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    "Message",
    messageSchema,
    "messages"
);