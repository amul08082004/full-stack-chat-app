const cloudinary = require("cloudinary").v2;

const API_KEY = "483254643619466";
const API_SECRET = "lXKF0vmxOVV1SOtVk_K1XmKw_nY";
const CLOUD_NAME = "dy8di0rnr";

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true
});

module.exports = cloudinary;
