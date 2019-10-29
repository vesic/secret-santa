require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
app.use(express.static("public"));
app.use(express.json());
const webPush = require("web-push");

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.log(
    "You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY " +
      "environment variables. You can use the following ones:"
  );
  console.log(webPush.generateVAPIDKeys());
  return;
}

webPush.setVapidDetails(
  "https://serviceworke.rs/",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.once("open", _ => {
  console.log("Database connected:", process.env.MONGO_URL);
});
db.on("error", err => {
  console.error("Connection error:", err);
});

require('./routes/push.js')(app, '/', webPush);
require('./routes/santas.js')(app, '/api/santas', webPush);
app.get("*", (req, res) => {
  // res.sendFile(__dirname + "/public/register.html");
  res.sendStatus(404);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
