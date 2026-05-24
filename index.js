const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connect } = require("./db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { ObjectId } = require("mongodb");

const mongoUri = process.env.MONGO_URI;
const dbname = "cook_book";

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

  // GET all recipes
  app.get("/recipes", async function (req, res) {
    const recipes = await db.collection("recipes").find().toArray();

    res.json(recipes);
  });

  // GET recipe by id
  app.get("/recipes/:id", async function (req, res) {
    const id = req.params.id;

    const recipes = await db.collection("recipes").findOne({
      _id: new ObjectId(id),
    });

    res.json(recipes);
  });
}

main();

app.listen(3000, function () {
  console.log("Server started");
});
