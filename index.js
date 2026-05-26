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

  // CREATE recipe
  app.post("/recipes", async function (req, res) {
    const recipeData = req.body;

    const result = await db.collection("recipes").insertOne(recipeData);

    res.json({
      message: "New recipe created",
      insertedId: result.insertedId,
    });
  });

  // PATCH recipe
  app.patch("/recipes/:id", async function (req, res) {
    const id = req.params.id;

    const updatedData = req.body;

    const result = await db.collection("recipes").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: updatedData,
      },
    );

    res.json({
      message: "Recipe updated",
      result: result,
    });
  });

  app.put("/recipes/:id", async function (req, res) {
    const id = req.params.id;

    const replacementDocument = req.body;

    const result = await db.collection("recipes").replaceOne(
      {
        _id: new ObjectId(id),
      },
      replacementDocument,
    );

    res.json({
      message: "Recipe replaced",
      result: result,
    });
  });

  app.delete("/recipes/:id", async function (req, res) {
    const id = req.params.id;

    const result = await db.collection("recipes").deleteOne({
      _id: new ObjectId(id),
    });

    res.json({
      message: "Recipes deleted",
      result: result,
    });
  });
}

main();

app.listen(3000, function () {
  console.log("Server started");
});
