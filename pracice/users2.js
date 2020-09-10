/***  Each and everything is perfect ***/

const express = require("express");
const router = express.Router();
const db = require("../config/db");

let numberOfCalls = 0;

router.get("/", async (req, res) => {
  try {
    const timeFrom = new Date();
    numberOfCalls++;

    const conn = await db.getConnection();

    const [rows] = await db.query("SELECT * FROM users");

    await conn.release();

    const timeTo = new Date();
    const elapsed = timeTo.getTime() - timeFrom.getTime();
    return res.send({
      rows,
      elapsed,
      average: Math.round(elapsed / numberOfCalls),
      numberOfCalls,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(404).send("Something went wrong!");
  }
});

module.exports = router;
