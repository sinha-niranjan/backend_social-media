const express = require("express");
const app = express();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "config/config.env" });
}

module.exports = app;
