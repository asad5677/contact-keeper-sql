const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const users = require("./routes/users");
const contacts = require("./routes/contacts");
const auth = require("./routes/auth");

app.use(cors());
app.use(bodyParser.json());
app.use("/api/users", users);
app.use("/api/contacts", contacts);
app.use("/api/auth", auth);

app.use("/", (req, res) => {
  return res.send({ msg: "Welcome to Node-mysql App!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server started on port " + PORT));
