// ### IMPORTS ### //
// npm
const express = require("express");
const router = require("./router");
const bodyParser = require("body-parser");

// config
const app = express();
const PORT = process.env.PORT || 3000;

// ### MIDDLEWARES ### //
app.use(bodyParser.json());
app.use(router);

// ### SERVER ### //
app.listen(PORT, () => {
  console.log("La broche tourne sur http://localhost:3000");
});
