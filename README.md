# Recipe Sharing API

## Project Summary

Recipe Sharing API is a RESTful API built using Express.js and MongoDB. The app allows user to register accounts, login using JWT, create and manage recipes, search recipes using different criteria, and add reviews to recipes.

The project is designed for user who want to share cooking recipes and discover meals based on difficulty, ingredients, cuisine type, estimated cooking cost, etc.

The API demonstrates:

- RESTful API design
- MongoDB document modelling
- JWT authentication
- Ownership verification
- Embedded documents and relationships
- Filtering and search functionality

## Target Audience

- Beginner cooks
- Budget-conscious user
- Food enthusiasts
- User searching recipe based on available ingredients

## Technologies used

- Node.js
- Express.js
- MongoDB Atlas
- JWT
- Bcrypt
- CORS
- ARC

## Features

### User Authentication

- User can register using email and password
- Passwords are hashed using bcrypt before storing in MongoDB
- User can log in and receive a JSON Web Token (JWT)
- Protected routes require a valid JWT

### Recipe Management

- Authenticated users can create recipes
- Recipe owners can update or delete their own recipes
- Ownership verification is implemented using the user ID stored inside the JWT

### Recipe Search and Filtering

Users can search recipes using :

- Difficulty
- Cuisine
- Maximum estimated cost
- Ingredients
- Tags

The API supports:

- Implicit AND filtering through MongoDB query objects
- Explicit OR filtering using the `$or` operator
- Ingredient searching using `$regex`
- Tag matching using `$all`

### Embedded Review System

- Users can add reviews to recipes
- Reviews are stored as embedded documents inside recipe documents
- Review owners can update or delete their own reviews

### MongoDB Features Demonstrated

The project demonstrates:

- Nested objects
- Arrays
- Arrays of objects
- Embedded documents
- MongoDB projection
- MongoDB query operators such as:
  - `$or`
  - `$all`
  - `$lte`
  - `$regex`
  - `$push`
  - `$pull`
  - `$set`

### Validation and Error Handling

The API includes:

- Required field validation
- Rating validation
- Invalid ObjectId validation
- Ownership verification
- Proper HTTP status responses

## Sample Mongo Documents

### User Document

```json
{
  "_id": "6657c1d9a123456789abcd01",
  "email": "ken@example.com",
  "password": "$2b$10$hashedpassword"
}
```

### Recipe Document

```json
{
  "_id": "6657c1d9a123456789abcd02",
  "title": "Chicken Fried Rice",
  "description": "Simple fried rice recipe",
  "difficulty": "Easy",
  "cuisine": "Asian",
  "estimatedCost": 8,
  "tags": ["quick", "budget"],
  "ingredients": [
    {
      "name": "Rice",
      "quantity": 2,
      "unit": "cups"
    },
    {
      "name": "Egg",
      "quantity": 2,
      "unit": "pieces"
    }
  ],
  "reviews": [
    {
      "review_id": "6657c1d9a123456789abcd03",
      "user_id": "6657c1d9a123456789abcd01",
      "rating": 5,
      "comment": "Very tasty"
    }
  ],
  "createdBy": "6657c1d9a123456789abcd01"
}
```

## API Documentation

### Register User

| Item     | Description       |
| -------- | ----------------- |
| Method   | POST              |
| Endpoint | `/users/register` |

#### Body

```json
{
  "email": "ken@example.com",
  "password": "password123"
}
```

#### Expected Response

```json
{
  "message": "User registered"
}
```

### Login User

| Item     | Description    |
| -------- | -------------- |
| Method   | POST           |
| Endpoint | `/users/login` |

#### Body

```json
{
  "email": "ken@example.com",
  "password": "password123"
}
```

#### Expected Response

```json
{
  "accessToken": "jwt_token"
}
```

### Get All Recipes

| Item     | Description |
| -------- | ----------- |
| Method   | GET         |
| Endpoint | `/recipes`  |

#### Expected Response

```json
[
  {
    "title": "Chicken Fried Rice"
  }
]
```

### Get Recipe By ID

| Item     | Description            |
| -------- | ---------------------- |
| Method   | GET                    |
| Endpoint | `/recipes/<recipe_id>` |

#### Expected Response

```json
{
  "title": "Chicken Fried Rice"
}
```

### Search Recipes

| Item     | Description              |
| -------- | ------------------------ |
| Method   | GET                      |
| Endpoint | `/recipes/search/filter` |

#### Query Parameters

- difficulty
- cuisine
- maxCost
- ingredient
- tags
- orMode

#### Example

```txt
/recipes/search/filter?difficulty=Easy&ingredient=rice
```

### Get Recipe Summaries

| Item     | Description        |
| -------- | ------------------ |
| Method   | GET                |
| Endpoint | `/recipes/summary` |

#### Expected Response

```json
[
  {
    "title": "Chicken Fried Rice",
    "difficulty": "Easy",
    "cuisine": "Asian"
  }
]
```

### Create Recipe

| Item     | Description |
| -------- | ----------- |
| Method   | POST        |
| Endpoint | `/recipes`  |

#### Headers

```txt
Authorization: Bearer <token>
```

#### Body

```json
{
  "title": "Pasta",
  "description": "Creamy pasta",
  "difficulty": "Medium",
  "cuisine": "Italian",
  "estimatedCost": 15
}
```

#### Expected Response

```json
{
  "insertedId": "recipe_id"
}
```

### Update Recipe

| Item     | Description            |
| -------- | ---------------------- |
| Method   | PATCH                  |
| Endpoint | `/recipes/<recipe_id>` |

#### Headers

```txt
Authorization: Bearer <token>
```

### Replace Recipe

| Item     | Description            |
| -------- | ---------------------- |
| Method   | PUT                    |
| Endpoint | `/recipes/<recipe_id>` |

#### Headers

```txt
Authorization: Bearer <token>
```

### Delete Recipe

| Item     | Description            |
| -------- | ---------------------- |
| Method   | DELETE                 |
| Endpoint | `/recipes/<recipe_id>` |

#### Headers

```txt
Authorization: Bearer <token>
```

### Add Review

| Item     | Description                    |
| -------- | ------------------------------ |
| Method   | POST                           |
| Endpoint | `/recipes/<recipe_id>/reviews` |

#### Headers

```txt
Authorization: Bearer <token>
```

#### Body

```json
{
  "rating": 5,
  "comment": "Very tasty"
}
```

### Update Review

| Item     | Description                                |
| -------- | ------------------------------------------ |
| Method   | PATCH                                      |
| Endpoint | `/recipes/<recipe_id>/reviews/<review_id>` |

#### Headers

```txt
Authorization: Bearer <token>
```

### Delete Review

| Item     | Description                                |
| -------- | ------------------------------------------ |
| Method   | DELETE                                     |
| Endpoint | `/recipes/<recipe_id>/reviews/<review_id>` |

#### Headers

```txt
Authorization: Bearer <token>
```

## Testing

| Method | Endpoint                                   | Purpose                        | Expected Result               |
| ------ | ------------------------------------------ | ------------------------------ | ----------------------------- |
| POST   | `/users/register`                          | Register new user              | User registered successfully  |
| POST   | `/users/login`                             | Login existing user            | JWT token returned            |
| GET    | `/recipes`                                 | Retrieve all recipes           | Array of recipes returned     |
| GET    | `/recipes/<recipe_id>`                     | Retrieve recipe by ID          | Single recipe returned        |
| GET    | `/recipes/search/filter`                   | Search recipes by criteria     | Matching recipes returned     |
| GET    | `/recipes/summary`                         | Retrieve projected recipe data | Only selected fields returned |
| POST   | `/recipes`                                 | Create recipe                  | Recipe inserted successfully  |
| PATCH  | `/recipes/<recipe_id>`                     | Update recipe partially        | Recipe updated successfully   |
| PUT    | `/recipes/<recipe_id>`                     | Replace recipe fully           | Recipe replaced successfully  |
| DELETE | `/recipes/<recipe_id>`                     | Delete recipe                  | Recipe deleted successfully   |
| POST   | `/recipes/<recipe_id>/reviews`             | Add review                     | Review added successfully     |
| PATCH  | `/recipes/<recipe_id>/reviews/<review_id>` | Update review                  | Review updated successfully   |
| DELETE | `/recipes/<recipe_id>/reviews/<review_id>` | Delete review                  | Review deleted successfully   |
