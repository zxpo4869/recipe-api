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

const generateAccessToken = function (id, email) {
  return jwt.sign(
    {
      user_id: id,
      email: email,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "1h",
    },
  );
};

const verifyToken = function (req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(403);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
};

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

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid recipe id",
      });
    }

    const recipe = await db.collection("recipes").findOne({
      _id: new ObjectId(id),
    });

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    res.json(recipe);
  });

  // CREATE recipe
  app.post("/recipes", verifyToken, async function (req, res) {
    const recipeData = req.body;

    // add a created by field in mongo db
    recipeData.createdBy = req.user.user_id;

    if (
      !recipeData.title ||
      !recipeData.description ||
      !recipeData.difficulty ||
      !recipeData.cuisine
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const result = await db.collection("recipes").insertOne(recipeData);

    res.json({
      message: "New recipe created",
      insertedId: result.insertedId,
    });
  });

  // PATCH recipe
  app.patch("/recipes/:id", verifyToken, async function (req, res) {
    const id = req.params.id;

    const updatedData = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid recipe id",
      });
    }

    // find recipe first
    const recipe = await db.collection("recipes").findOne({
      _id: new ObjectId(id),
    });

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    // ownership check
    if (recipe.createdBy != req.user.user_id) {
      return res.status(403).json({
        message: "You are not the owner",
      });
    }

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

  // PUT recipe
  app.put("/recipes/:id", verifyToken, async function (req, res) {
    const id = req.params.id;

    const replacementDocument = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid recipe id",
      });
    }

    // find recipe first
    const recipe = await db.collection("recipes").findOne({
      _id: new ObjectId(id),
    });

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    // ownership check
    if (recipe.createdBy != req.user.user_id) {
      return res.status(403).json({
        message: "You are not the owner",
      });
    }

    replacementDocument.createdBy = recipe.createdBy;

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

  // DELETE recipe
  app.delete("/recipes/:id", verifyToken, async function (req, res) {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid recipe id",
      });
    }

    // find recipe first
    const recipe = await db.collection("recipes").findOne({
      _id: new ObjectId(id),
    });

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    // ownership check
    if (recipe.createdBy != req.user.user_id) {
      return res.status(403).json({
        message: "You are not the owner",
      });
    }

    const result = await db.collection("recipes").deleteOne({
      _id: new ObjectId(id),
    });

    res.json({
      message: "Recipe deleted",
      result: result,
    });
  });

  // SEARCH recipe
  app.get("/recipes/search/filter", async function (req, res) {
    let criteria = {};

    // difficulty
    if (req.query.difficulty) {
      criteria.difficulty = req.query.difficulty;
    }

    // cuisine
    if (req.query.cuisine) {
      criteria.cuisine = req.query.cuisine;
    }

    // max cost
    if (req.query.maxCost) {
      criteria.estimatedCost = {
        $lte: parseInt(req.query.maxCost),
      };
    }

    // ingredients search
    if (req.query.ingredient) {
      criteria["ingredients.name"] = {
        $regex: req.query.ingredient,
        $options: "i",
      };
    }

    const results = await db.collection("recipes").find(criteria).toArray();

    res.json(results);
  });

  // REGISTER user
  app.post("/users/register", async function (req, res) {
    const userData = req.body;

    // check if user is already in database by finding email
    const existingUser = await db.collection("users").findOne({
      email: userData.email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already used",
      });
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    userData.password = hashedPassword;

    const result = await db.collection("users").insertOne(userData);

    res.json({
      message: "User registered",
      insertedId: result.insertedId,
    });
  });

  // LOGIN user
  app.post("/users/login", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    // find user
    const user = await db.collection("users").findOne({
      email: email,
    });

    if (!user) {
      return res.status(400).json({
        message: "User doesn't exist",
      });
    }

    // compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid/wrong password",
      });
    }

    // generate token
    const accessToken = generateAccessToken(user._id, user.email);

    res.json({
      accessToken: accessToken,
    });
  });

  // PROTECTED profile route
  app.get("/profile", verifyToken, function (req, res) {
    res.json({
      message: "Protected profile route",
      user: req.user,
    });
  });

  // ADD review
  app.post("/recipes/:id/reviews", verifyToken, async function (req, res) {
    const id = req.params.id;

    const reviewData = req.body;

    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    reviewData.review_id = new ObjectId();

    reviewData.user_id = req.user.user_id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid recipe id",
      });
    }

    const result = await db.collection("recipes").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $push: {
          reviews: reviewData,
        },
      },
    );

    res.json({
      message: "Review added",
      result: result,
    });
  });

  // PATCH review
  app.patch(
    "/recipes/:recipeId/reviews/:reviewId",
    verifyToken,
    async function (req, res) {
      const recipeId = req.params.recipeId;

      const reviewId = req.params.reviewId;

      const updatedData = req.body;

      if (!ObjectId.isValid(recipeId)) {
        return res.status(400).json({
          message: "Invalid recipe id",
        });
      }

      const recipe = await db.collection("recipes").findOne({
        _id: new ObjectId(recipeId),
      });

      if (!recipe) {
        return res.status(404).json({
          message: "Recipe not found",
        });
      }

      const review = recipe.reviews.find(function (r) {
        return r.review_id.toString() == reviewId;
      });

      if (!review) {
        return res.status(404).json({
          message: "Review not found",
        });
      }

      // ownership check
      if (review.user_id != req.user.user_id) {
        return res.status(403).json({
          message: "You are not the owner",
        });
      }

      const result = await db.collection("recipes").updateOne(
        {
          _id: new ObjectId(recipeId),
          "reviews.review_id": review.review_id,
        },
        {
          $set: {
            "reviews.$.rating": updatedData.rating,
            "reviews.$.comment": updatedData.comment,
          },
        },
      );

      res.json({
        message: "Review updated",
        result: result,
      });
    },
  );

  // DELETE review
  app.delete(
    "/recipes/:recipeId/reviews/:reviewId",
    verifyToken,
    async function (req, res) {
      const recipeId = req.params.recipeId;

      const reviewId = req.params.reviewId;

      if (!ObjectId.isValid(recipeId)) {
        return res.status(400).json({
          message: "Invalid recipe id",
        });
      }

      const recipe = await db.collection("recipes").findOne({
        _id: new ObjectId(recipeId),
      });

      if (!recipe) {
        return res.status(404).json({
          message: "Recipe not found",
        });
      }

      const review = recipe.reviews.find(function (r) {
        return r.review_id.toString() == reviewId;
      });

      if (!review) {
        return res.status(404).json({
          message: "Review not found",
        });
      }

      // ownership check
      if (review.user_id != req.user.user_id) {
        return res.status(403).json({
          message: "You are not the owner",
        });
      }

      const result = await db.collection("recipes").updateOne(
        {
          _id: new ObjectId(recipeId),
        },
        {
          $pull: {
            reviews: {
              review_id: review.review_id,
            },
          },
        },
      );

      res.json({
        message: "Review deleted",
        result: result,
      });
    },
  );
}

main();

app.listen(3000, function () {
  console.log("Server started");
});
