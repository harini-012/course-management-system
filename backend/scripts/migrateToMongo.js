
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const connectDB = require("../config/db");

const DB_FILE = path.join(
    __dirname,
    "../../mock-api/db.json"
);

const COLLECTIONS = [
    "students",
    "admins",
    "courses",
    "enrollments",
    "progress",
    "sessions",
    "appState",
    "draftCourses"
];

async function migrate() {
    try {
        // 1. Read existing JSON database
        if (!fs.existsSync(DB_FILE)) {
            throw new Error("db.json file not found");
        }

        const jsonData = JSON.parse(
            fs.readFileSync(DB_FILE, "utf8")
        );

        // 2. Connect to MongoDB
        await connectDB();

        const db = mongoose.connection.db;

        console.log("\nStarting MongoDB Migration...\n");

        for (const collectionName of COLLECTIONS) {
            const records = jsonData[collectionName] || [];

            if (!Array.isArray(records)) {
                console.log(
                    `Skipping ${collectionName}: invalid data`
                );
                continue;
            }

            const collection = db.collection(collectionName);

            if (records.length === 0) {
                console.log(
                    `${collectionName}: 0 records`
                );
                continue;
            }

            // Preserve all original JSON fields and IDs.
            // Existing records are updated by their
            // original string ID when available.
            let inserted = 0;
            let updated = 0;

            for (const record of records) {
                if (record.id === undefined ||
                    record.id === null) {
                    throw new Error(
                        `Missing ID in ${collectionName}`
                    );
                }

                const document = { ...record };

                // MongoDB manages its own _id.
                delete document._id;

                const result = await collection.updateOne(
                    { id: String(record.id) },
                    {
                        $set: {
                            ...document,
                            id: String(record.id)
                        }
                    },
                    { upsert: true }
                );

                if (result.upsertedCount > 0) {
                    inserted++;
                } else if (result.matchedCount > 0) {
                    updated++;
                }
            }

            console.log(
                `${collectionName}: ${inserted} inserted, ${updated} matched`
            );
        }

        console.log("\nMongoDB migration completed!");

    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
    }
}

migrate();
