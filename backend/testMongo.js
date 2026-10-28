
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");

async function testMongo() {
    try {
        await connectDB();
        console.log("MongoDB Test PASSED");
    } catch (error) {
        console.log("MongoDB Test FAILED");
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

testMongo();
