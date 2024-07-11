const { GoogleSpreadsheet } = require("google-spreadsheet");
const axios = require("axios");
require("dotenv").config();

// ID of your Google Sheet (can be found in the sheet URL)
const SPREADSHEET_ID = "1rahnRPlPUtV8_F0bjSAIsiZD8VG4HIoOomoc5EisiDw";
const DOC = new GoogleSpreadsheet(SPREADSHEET_ID);

// API endpoint and token
const API_ENDPOINT = "https://yourapi.com/admin/post";
const AUTH_TOKEN = "YOUR_ADMIN_TOKEN";

async function authenticateGoogleSheets() {
  // Assuming you've saved your service account credentials in a .json file
  // Ensure this JSON file path is correctly referenced in your project environment
  await DOC.useServiceAccountAuth(
    require("./path-to-your-service-account-credentials.json")
  );
  await DOC.loadInfo(); // Loads document properties and worksheets
}

async function fetchSheetData() {
  const sheet = DOC.sheetsByIndex[0]; // Assuming we want the first sheet
  const rows = await sheet.getRows();
  return rows;
}

async function postToApi(data) {
  const config = {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      "Content-Type": "application/json",
    },
  };
  const body = {
    text_content: data.text_content,
    image: data.image,
    user_id: data.user_id,
    neighborhood_id: data.neighborhood_id,
    created_at: data.created_at,
    likes_count: data.likes_count,
  };

  try {
    const response = await axios.post(API_ENDPOINT, body, config);
    console.log("Post created successfully:", response.data);
  } catch (error) {
    console.error("Failed to create post:", error.response.data);
  }
}

async function main() {
  await authenticateGoogleSheets();
  const rows = await fetchSheetData();
  for (const row of rows) {
    await postToApi(row);
  }
}

main();
