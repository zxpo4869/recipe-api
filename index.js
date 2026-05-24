const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connect } = require("./db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { ObjectId } = require("mongodb");

const mongoUri = process.env.MONGO_URI;
const dbname = "my_database";

let app = express();

app.use(express.json());
app.use(cors());

async function main() {
  const db = await connect(mongoUri, dbname);

  app.get("/", function (req, res) {
    res.json({
      message: "API is working",
    });
  });
}

main();

app.listen(3000, function () {
  console.log("Server started");
});
