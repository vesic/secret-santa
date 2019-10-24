const mongoose = require("mongoose");
const usersRoute = require("./routes/user");
const express = require("express");
const app = express();

require("dotenv").config();

app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

const db = mongoose.connection;

db.once("open", _ => {
  console.log("Database connected:", process.env.MONGO_URL);
});

db.on("error", err => {
  console.error("Connection error:", err);
});

app.use(express.json());

app.use("/api/users", usersRoute);

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

