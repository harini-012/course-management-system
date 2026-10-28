
require("dotenv").config();

const mongoose = require("mongoose");
const fs = require("node:fs");
const path = require("node:path");

const resources = [
  "students",
  "admins",
  "courses",
  "enrollments",
  "progress",
  "sessions",
  "appState",
  "draftCourses"
];

async function reconcile() {
  const apply = process.argv.includes("--apply");

  const jsonPath = path.resolve(
    __dirname,
    "../../mock-api/db.json"
  );

  if (!fs.existsSync(jsonPath)) {
    throw new Error("mock-api/db.json not found");
  }

  const jsonData = JSON.parse(
    fs.readFileSync(jsonPath, "utf8")
  );

  await mongoose.connect(process.env.MONGO_URI);

  let totalMissing = 0;
  let totalConflicts = 0;
  let totalInserted = 0;

  for (const resource of resources) {
    const records = jsonData[resource] || [];

    if (!Array.isArray(records)) {
      throw new Error(`${resource} is not an array`);
    }

    const collection =
      mongoose.connection.db.collection(resource);

    let missing = 0;
    let conflicts = 0;
    let inserted = 0;

    for (const record of records) {
      if (record.id === undefined || record.id === null) {
        console.warn(
          `${resource}: record without id skipped`
        );
        continue;
      }

      const id = String(record.id);

      const existing = await collection.findOne({ id });

      if (!existing) {
        missing++;

        if (apply) {
          await collection.insertOne({
            ...record,
            id
          });

          inserted++;
        }

        continue;
      }

      const { _id, ...mongoRecord } = existing;

      const normalize = value => {
        if (Array.isArray(value)) {
          return value.map(normalize);
        }

        if (value && typeof value === "object") {
          return Object.fromEntries(
            Object.entries(value)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, val]) => [
                key,
                normalize(val)
              ])
          );
        }

        return value;
      };

      const jsonRecord = {
        ...record,
        id
      };

      if (
        JSON.stringify(normalize(mongoRecord)) !==
        JSON.stringify(normalize(jsonRecord))
      ) {
        conflicts++;

        console.log(
          `CONFLICT: ${resource} / ${id}`
        );
      }
    }

    totalMissing += missing;
    totalConflicts += conflicts;
    totalInserted += inserted;

    console.log(
      `${resource}: missing=${missing}, conflicts=${conflicts}, inserted=${inserted}`
    );
  }

  console.log("\n=== RECONCILIATION SUMMARY ===");
  console.log("Missing records:", totalMissing);
  console.log("Conflicting records:", totalConflicts);
  console.log("Inserted records:", totalInserted);

  if (!apply) {
    console.log(
      "\nREAD-ONLY CHECK COMPLETE. No data was changed."
    );
  } else {
    console.log(
      "\nMissing records copied. Existing MongoDB records were not overwritten."
    );
  }
}

reconcile()
  .catch(error => {
    console.error("Migration check failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
