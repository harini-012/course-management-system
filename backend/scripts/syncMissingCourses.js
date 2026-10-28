
require("dotenv").config();

const mongoose = require("mongoose");

async function syncMissingCourses() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const response = await fetch(
            "http://localhost:5000/courses"
        );

        if (!response.ok) {
            throw new Error("Unable to read JSON Server courses");
        }

        const jsonCourses = await response.json();

        const collection = mongoose.connection.db.collection("courses");

        let inserted = 0;
        let skipped = 0;

        for (const course of jsonCourses) {
            if (course.id === undefined || course.id === null) {
                throw new Error("Course without an ID found. Sync stopped.");
            }

            const id = String(course.id);

            const existing = await collection.findOne({ id });

            if (existing) {
                skipped++;
                continue;
            }

            await collection.insertOne({
                ...course,
                id
            });

            inserted++;
        }

        console.log("Course sync completed");
        console.log("New courses copied:", inserted);
        console.log("Existing courses preserved:", skipped);

    } catch (error) {
        console.error("Sync failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

syncMissingCourses();
