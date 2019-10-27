require("dotenv").config();
const mongoose = require("mongoose");
const santasRoute = require("./routes/santa");
const express = require("express");
const app = express();
app.use(express.static("public"));
app.use(express.json());

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
  res.sendFile(__dirname + "/public/index.html");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
