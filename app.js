const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// future routes here

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
