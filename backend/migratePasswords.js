const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

async function migrate() {
  const file = path.join(__dirname, "../mock-api/db.json");
  const db = JSON.parse(fs.readFileSync(file, "utf8"));

  for (const resource of ["students", "admins"]) {
    for (const user of db[resource] || []) {
      if (typeof user.password === "string") {
        user.passwordHash = await bcrypt.hash(user.password, 12);
        delete user.password;
      }
    }
  }

  fs.writeFileSync(file, JSON.stringify(db, null, 2));
  console.log("Migration completed");
}

migrate().catch(console.error);