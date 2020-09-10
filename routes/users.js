const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

const { getToken } = require("../utils/jwtOffice");
const db = require("../config/db");

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Sql queries
    const getUserQuery = `SELECT * FROM users WHERE email = ?`;
    const insertUserQuery = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;

    const conn = await db.getConnection();

    // Check if user is already avaiable or not
    const users = await db.execute(getUserQuery, [email]);
    if (users[0].length > 0) {
      await conn.release();
      return res.status(400).send({
        error: "User already exists!",
      });
    }

    // Inserting the user in DB
    const result = await db.execute(insertUserQuery, [
      name,
      email,
      hashedPassword,
    ]);
    await conn.release();

    // establishing jsonwebtoken
    const jwtPayload = {
      user: {
        id: result[0].insertId,
      },
    };

    const token = await getToken(jwtPayload);

    return res.status(200).send({ token });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send("Something went wrong!");
  }
});

module.exports = router;

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
/************************  Testing phase *****************************/
// let numberOfCalls = 0;

// router.get("/", async (req, res) => {
//   const db = require("../config/db");
//   try {
//     const conn = await db.getConnection();
//     const timeFrom = new Date();
//     numberOfCalls++;
//     const [rows] = await db.execute("SELECT * FROM customers");
//     await conn.release();

//     const timeTo = new Date();
//     const elapsed = timeTo.getTime() - timeFrom.getTime();

//     return res.send({
//       rows,
//       elapsed,
//       average: Math.round(elapsed / numberOfCalls),
//       numberOfCalls,
//     });
//   } catch (err) {
//     console.log(err.message);
//     return res.status(500).send("Something went wrong!");
//   }
// });
