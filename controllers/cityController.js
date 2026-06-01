const asyncHandler = require("../middlewares/asyncHandler");
const { sendSuccess } = require("../utils/response");
const muzaffarpurCities = require("../data/muzaffarpurCities");

const getCities = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, "Cities fetched successfully", {
    cities: muzaffarpurCities,
  });
});

module.exports = {
  getCities,
};