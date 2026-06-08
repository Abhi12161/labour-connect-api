// const asyncHandler = require("../middlewares/asyncHandler");
// const { sendSuccess } = require("../utils/response");
// const muzaffarpurCities = require("../data/muzaffarpurCities");

// const getCities = asyncHandler(async (req, res) => {
//   return sendSuccess(res, 200, "Cities fetched successfully", {
//     cities: muzaffarpurCities,
//   });
// });

// module.exports = {
//   getCities,
// };
const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");
const City = require("../models/City");

const getCities = asyncHandler(async (req, res) => {
  const cities = await City.find()
    .select("name latitude longitude block district")
    .sort({ name: 1 })
    .lean();

  return sendSuccess(res, 200, "Cities fetched successfully", {
    cities,
  });
});

module.exports = {
  getCities,
};