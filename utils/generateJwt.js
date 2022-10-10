const jwt = require("jsonwebtoken");
module.exports = function generateJwt(id, login) {
  return jwt.sign({ id, login }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });
};
