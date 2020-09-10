const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../config/db");

// @route   GET api/contacts
// @desc    Get all user's contacts
// @access  Private
router.get("/", auth, async (req, res) => {
  const userId = req.user.id;

  const getContactsQuery = `SELECT * FROM contacts WHERE user_id = ?`;

  try {
    const conn = await db.getConnection();
    const [rows] = await db.execute(getContactsQuery, [userId]);
    await conn.release();

    return res.send({ contacts: rows });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ error: "Something went wrong!" });
  }
});

// @route   POST api/contacts
// @desc    Add user's contact
// @access  Private
router.post("/", auth, async (req, res) => {
  // Data from user (request)
  const userId = req.user.id;
  let { name, phone, email, type } = req.body;

  // SQL queries
  let insertContactQuery;
  let insertContactPlaceholder;
  if (!type) {
    insertContactQuery = `INSERT INTO contacts (user_id, name, phone, email) values (?, ?, ?, ?)`;
    insertContactPlaceholder = [userId, name, phone, email];
  } else {
    insertContactQuery = `INSERT INTO contacts (user_id, name, phone, email, type) values (?, ?, ?, ?, ?)`;
    insertContactPlaceholder = [userId, name, phone, email, type];
  }

  const getContactQuery = `SELECT * FROM contacts WHERE contact_id = ?`;

  // Connections
  try {
    const conn = await db.getConnection();

    // Inserting contact into database
    const [rows] = await db.execute(
      insertContactQuery,
      insertContactPlaceholder
    );
    const insertedContactId = rows.insertId;

    // Getting inserted contact back from database
    const contact = await db.execute(getContactQuery, [insertedContactId]);

    await conn.release();

    return res.send({ contact: contact[0][0] });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ error: "Something went wrong!" });
  }
});

// @route   PUT api/contacts
// @desc    Update user's contact
// @access  Private
router.put("/:id", auth, async (req, res) => {
  const contactParamsId = req.params.id;
  const userAuthId = req.user.id;

  const getContactQuery = `SELECT * FROM contacts WHERE contact_id = ?`;
  const updateContactQuery = `UPDATE contacts SET name = ?, email = ?, phone = ?, type = ? WHERE contact_id = ?`;

  try {
    const conn = await db.getConnection();

    // const timeFrom = new Date();

    // Retrieve contact from DB
    const result = await db.execute(getContactQuery, [contactParamsId]);
    if (result[0].length === 0) {
      await conn.release();
      return res.status(400).send({ error: "Contact not found!" });
    }

    // Destructuring the returned contact
    let { contact_id, name, email, phone, type, user_id } = result[0][0];

    // check wheather user owns that contact or not
    if (user_id !== userAuthId) {
      await conn.release();
      return res.status(401).send({ error: "Unauthorization! access denied." });
    }

    // updating the values that are given from the body
    if (req.body.name) name = req.body.name;
    if (req.body.email) email = req.body.email;
    if (req.body.phone) phone = req.body.phone;
    if (req.body.type) type = req.body.type;

    await db.execute(updateContactQuery, [
      name,
      email,
      phone,
      type,
      contact_id,
    ]);

    const [rows] = await db.execute(getContactQuery, [contact_id]);

    // const timeTo = new Date();
    // const elapsed = timeTo.getTime() - timeFrom.getTime();

    await conn.release();

    return res.send({ contact: rows[0] });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({ error: "Something went wrong!" });
  }
});

// @route   DELETE api/contacts
// @desc    Delete user's contact
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  const paramsId = req.params.id;
  const userAuthId = req.user.id;

  const getContactQuery = `SELECT * FROM contacts WHERE contact_id = ?`;
  const deleteContactQuery = `DELETE FROM contacts WHERE contact_id = ?`;

  try {
    const conn = await db.getConnection();

    // Get contact from DB by paramsID
    const contacts = await db.execute(getContactQuery, [paramsId]);
    if (contacts[0].length === 0) {
      await conn.release();
      return res.status(404).send({ error: "Contact not found!" });
    }
    const contact = contacts[0][0];

    // Verify contact with user
    if (contact.user_id !== userAuthId) {
      await conn.release();
      return res.status(401).send({ error: "Unauthorization! access denied." });
    }

    // if user owns that contact then delete it
    await db.execute(deleteContactQuery, [paramsId]);

    await conn.release();

    // return success message
    return res.send({ contact });
  } catch (err) {
    // Return error if does
    console.log(err.message);
    return res.status(500).send({ error: "Something went wrong!" });
  }
});

module.exports = router;

/***
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
 *
 */
/*****************  Testing phase *****************/
// let numberOfCalls = 0;

// router.get("/", async (req, res) => {
//   const db = require("../config/db");
//   const getContactsQuery = `SELECT * FROM orders`;

//   try {
//     const conn = await db.getConnection();
//     const timeFrom = new Date();
//     numberOfCalls++;
//     const [rows] = await db.execute(getContactsQuery);

//     const timeTo = new Date();
//     const elapsed = timeTo.getTime() - timeFrom.getTime();

//     await conn.release();

//     return res.send({
//       rows,
//       elapsed,
//       average: Math.round(elapsed / numberOfCalls),
//       numberOfCalls,
//     });
//   } catch (err) {
//     console.log(err.message);
//     return res.status(500).send({ error: "Something went wrong!" });
//   }
// });
