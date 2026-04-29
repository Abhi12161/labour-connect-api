const path = require("path");
const { exec } = require("child_process");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env.atlas") });

const uri = process.env.MONGO_URI;
const dbName = process.env.ATLAS_DB_NAME || "mydb";
const backupPath = path.resolve(process.cwd(), "backup", dbName);

exec(`mongorestore --uri="${uri}" "${backupPath}"`, (err, stdout, stderr) => {
  if (err) {
    console.error("Restore failed");
    if (stderr) {
      console.error(stderr.trim());
    }
    return;
  }

  if (stdout) {
    console.log(stdout.trim());
  }

  console.log("Restore done");
});
