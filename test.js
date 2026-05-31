// test.js
require("dotenv").config();
const { MongoClient } = require("mongodb");

(async () => {
  try {
    console.log("Connecting...");

    const client = new MongoClient(process.env.MONGO_URI);

    await client.connect();

    console.log("CONNECTED SUCCESSFULLY");

    await client.close();
  } catch (err) {
    console.error("FULL ERROR:");
    console.dir(err, { depth: null });
  }
})();