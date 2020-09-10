const { isTokenVerified } = require("../utils/jwtOffice");

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check token is available or not in header
  if (!token)
    return res.status(401).send({ error: "Unauthorization! access denied." });

  // if token, verify it
  try {
    const decoded = await isTokenVerified(token);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log("Middleware error: ", err.message);
    return res.status(401).send({ error: "Invalid token!" });
  }
};
