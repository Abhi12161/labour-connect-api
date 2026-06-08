const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");

const City = require("./models/City");

mongoose
  .connect("mongodb://127.0.0.1:27017/labourApp")
  .then(() => console.log("MongoDB Connected"));

const cities = [];

fs.createReadStream("./data/Muzaffarpur_OFFICIAL_Villages_LatLng.csv")
  .pipe(csv())
  .on("data", (row) => {
    cities.push({
      name: row["Village Name"],
      block: row["Block"],
      district: row["District"],
      state: row["State"] || "Bihar",
      latitude: Number(row["Latitude"]) || 0,
      longitude: Number(row["Longitude"]) || 0,
    });
  })
  .on("end", async () => {
    try {
      await City.deleteMany({});

      await City.insertMany(cities);

      console.log(`${cities.length} villages imported`);

      process.exit();
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });