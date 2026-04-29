const path = require("path");
const dotenv = require("dotenv");

const envFile = process.argv[2] || ".env";
const envPath = path.resolve(process.cwd(), envFile);

dotenv.config({ path: envPath });

console.log(`Using env file: ${envFile}`);

require("../server");
