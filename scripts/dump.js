const path = require("path");
const { exec } = require("child_process");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGO_URI;
const backupDir = path.resolve(process.cwd(), "backup");

exec(`mongodump --uri="${uri}" --out="${backupDir}"`, (err, stdout, stderr) => {
  if (err) {
    console.error("Dump failed");
    if (stderr) {
      console.error(stderr.trim());
    }
    return;
  }

  if (stdout) {
    console.log(stdout.trim());
  }

  console.log("Backup done");
});
