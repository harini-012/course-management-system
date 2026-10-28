
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");

const expectedCounts = {
    students: 7,
    admins: 5,
    courses: 16,
    enrollments: 45,
    progress: 76,
    sessions: 1,
    appState: 1,
    draftCourses: 0
};

async function verifyMongo() {
    try {
        await connectDB();

        const db = mongoose.connection.db;

        let allPassed = true;
        let totalRecords = 0;

        console.log("\nVerifying MongoDB Records...\n");

        for (const [name, expected] of Object.entries(expectedCounts)) {
            const collection = db.collection(name);
            const actual = await collection.countDocuments();

            const passed = actual === expected;

            if (!passed) {
                allPassed = false;
            }

            totalRecords += actual;

            console.log(
                `${passed ? "PASS" : "FAIL"} | ${name} | Expected: ${expected} | Actual: ${actual}`
            );
        }

        console.log("\nTotal MongoDB Records:", totalRecords);

        if (allPassed) {
            console.log("\nALL COLLECTION COUNTS VERIFIED");
        } else {
            console.log("\nVERIFICATION FAILED");
            process.exitCode = 1;
        }

    } catch (error) {
        console.error("Verification Error:", error.message);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
    }
}

verifyMongo();
