import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import axios from "axios";
import "dotenv/config";

// ID of your Google Sheet (can be found in the sheet URL)
const SPREADSHEET_ID = "1rahnRPlPUtV8_F0bjSAIsiZD8VG4HIoOomoc5EisiDw";
let doc;

// API endpoint and token
const API_ENDPOINT = "http://localhost:3000/v1/admin/posts";
const AUTH_TOKEN = process.env.ADMIN_AUTH_TOKEN;
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const authenticateGoogleSheets = async () => {
  const creds = await import("./secrets/village-404104-79076a5fb68f.json", {
    assert: { type: "json" },
  }).then((module) => module.default);

  const serviceAccountAuth = new JWT({
    email: creds.client_email,
    key: creds.private_key.replace(/\\n/g, "\n"), // Ensure newline characters are handled correctly
    scopes: SCOPES,
  });

  doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  console.log("Authenticated and loaded document:", doc.title);
};

const fetchSheetData = async () => {
  const sheet = doc.sheetsByIndex[0];
  return await sheet.getRows();
};

const postToApi = async (data) => {
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
};

async function main() {
  await authenticateGoogleSheets();
  const rows = await fetchSheetData();
  for (const row of rows) {
    console.log("row", row);
  }
}

main();
