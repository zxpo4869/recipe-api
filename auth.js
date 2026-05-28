const jwt = require("jsonwebtoken");

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

module.exports = {
  generateAccessToken,
  verifyToken,
};
