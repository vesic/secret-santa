require("dotenv").config();
const mongoose = require("mongoose");
const santasRoute = require("./routes/santa");
const express = require("express");
const app = express();
app.use(express.static("public"));
app.use(express.json());
require('./push.js')(app, '/');

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.once("open", _ => {
  console.log("Database connected:", process.env.MONGO_URL);
});
db.on("error", err => {
  console.error("Connection error:", err);
});

app.use("/api/santas", santasRoute);
app.get("*", (req, res) => {
  // res.sendFile(__dirname + "/public/register.html");
  res.sendStatus(404);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
