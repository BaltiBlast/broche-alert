const Airtable = require("airtable");
require("dotenv").config();

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_API_BASE_ID;

const base = new Airtable({ apiKey }).base(baseId);

module.exports = base;
