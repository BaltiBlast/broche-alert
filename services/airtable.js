// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// npm
const Airtable = require("airtable");
require("dotenv").config();

// -------------------------------------------------------------------------------------------------------------------- //
// ===== CONFIG ===== //
const { AIRTABLE_API_BASE_ID, AIRTABLE_API_KEY } = process.env;

const apiKey = AIRTABLE_API_KEY;
const baseId = AIRTABLE_API_BASE_ID;

const base = new Airtable({ apiKey }).base(baseId);
const db = base;

// -------------------------------------------------------------------------------------------------------------------- //
// ===== AIRTABLE TABLES ===== //
const TABLES = {
  users: "users",
  subscriptions: "subscriptions",
  streamers: "streamers",
  reset_password: "reset_password",
};

module.exports = { db, TABLES };
