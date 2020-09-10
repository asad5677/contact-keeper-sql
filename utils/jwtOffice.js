const jwt = require("jsonwebtoken");

const secretKey = "secretKey";

function getToken(payload) {
  return jwt.sign(payload, secretKey);
}

function isTokenVerified(token) {
  return jwt.verify(token, secretKey);
}

module.exports = {
  getToken,
  isTokenVerified,
};
