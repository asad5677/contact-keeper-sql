const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { getToken } = require("../utils/jwtOffice");
const db = require("../config/db");

// @route   GET api/auth
// @desc    Get loggedIn user
// @access  Private
router.get("/", auth, async (req, res) => {
  const getUserQuery = `SELECT 
      user_id,
      name,
      email
    FROM users 
    WHERE user_id = ?`;

  try {
    const conn = await db.getConnection();
    const [rows] = await db.execute(getUserQuery, [req.user.id]);
    const user = rows[0];
    await conn.release();

    return res.send({ user });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ error: "Something went wrong!" });
  }
});

// @route   POST api/auth
// @desc    Auth user and get token
// @access  Public
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  const getUserQuery = `SELECT * FROM users WHERE email = ?`;

  try {
    const conn = await db.getConnection();

    // Check with email if user is in Db or not;
    const [user] = await db.execute(getUserQuery, [email]);
    if (user.length === 0) {
      await conn.release();
      return res.status(400).send({ error: "Invalid email or password!" });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      await conn.release();
      return res.status(400).send({ error: "Invalid username or password!" });
    }

    await conn.release();

    const jwtPayload = {
      user: {
        id: user[0].user_id,
      },
    };

    const token = await getToken(jwtPayload);

    return res.send({ token });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ error: "Something went wrong!" });
  }
});

module.exports = router;
