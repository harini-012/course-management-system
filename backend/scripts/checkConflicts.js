
require("dotenv").config();

const mongoose = require("mongoose");
const fs = require("node:fs");
const path = require("node:path");

const targets = {
  students: [
    "2ktXrV4EtDs",
    "faDPPfA_RCQ"
  ],
  admins: [
    "2Cng3ZxFkpw"
  ],
  appState: [
    "current"
  ]
};

const excludedFields = new Set([
  "_id",
  "password",
  "passwordHash",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "jwtSecret"
]);

function normalize(value) {
  if (Array.isArray(value)) {
    return value.map(normalize);
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
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
}

function compareFields(jsonRecord, mongoRecord) {
  const fields = new Set([
    ...Object.keys(jsonRecord || {}),
    ...Object.keys(mongoRecord || {})
  ]);

  const differences = [];

  for (const field of fields) {
    if (excludedFields.has(field)) {
      continue;
    }

    const jsonValue = normalize(
      jsonRecord?.[field]
    );

    const mongoValue = normalize(
      mongoRecord?.[field]
    );

    if (
      JSON.stringify(jsonValue) !==
      JSON.stringify(mongoValue)
    ) {
      differences.push(field);
    }
  }

  return differences;
}

async function main() {
  const jsonPath = path.resolve(
    __dirname,
    "../../mock-api/db.json"
  );

  const jsonData = JSON.parse(
    fs.readFileSync(jsonPath, "utf8")
  );

  await mongoose.connect(
    process.env.MONGO_URI
  );

  for (const [resource, ids] of Object.entries(targets)) {
    const collection =
      mongoose.connection.db.collection(resource);

    for (const id of ids) {
      const jsonRecord =
        (jsonData[resource] || []).find(
          record => String(record.id) === id
        );

      const mongoRecord =
        await collection.findOne({ id });

      if (!jsonRecord || !mongoRecord) {
        console.log(
          `${resource} / ${id}: record missing`
        );
        continue;
      }

      const differences = compareFields(
        jsonRecord,
        mongoRecord
      );

      console.log(`\n${resource} / ${id}`);

      console.log(
        differences.length
          ? `Different fields: ${differences.join(", ")}`
          : "No differences in compared fields"
      );
    }
  }
}

main()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
