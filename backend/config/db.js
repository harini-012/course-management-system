
const mongoose = require("mongoose");

async function connectDB() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing");
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected Successfully");
        console.log("Database:", mongoose.connection.name);

    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        throw error;
    }
}

module.exports = connectDB;
