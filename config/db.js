const mysql = require("mysql2");
const config = require("config");

const HOST = config.get("HOST");
const USER = config.get("USER");
const PASSWORD = config.get("PASSWORD");
const DATA_BASE = config.get("DATA_BASE");

console.log({ HOST, USER, PASSWORD, DATA_BASE });

function createPool() {
  try {
    const pool = mysql.createPool({
      host: HOST,
      user: USER,
      password: PASSWORD,
      database: DATA_BASE,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
    });

    const promisePool = pool.promise();

    console.log("DB connected successfully!");

    return promisePool;
  } catch (error) {
    return console.log(`DB Error - ${error}`);
  }
}

module.exports = createPool();
