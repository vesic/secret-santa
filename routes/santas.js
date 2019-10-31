const auth = require("./auth");
const bcrypt = require("bcryptjs");
const { Santa, validate } = require("../models/santa");
const faker = require("faker");
const subscriptions = require("../shared/subscriptions.js");

module.exports = function(app, route, webPush) {
  app.get(route + "/current", auth, async (req, res) => {
    const santa = await Santa.findById(req.santa._id).select("-password");
    res.send(santa);
  });

  app.get(route + "/", async (req, res) => {
    const santas = await Santa.find({});
    res.send({ data: santas });
  });
  
  app.post(route + "/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let santa = await Santa.findOne({ email: req.body.email });
    if (santa) return res.status(400).send("Santa already registered.");
    santa = new Santa({
      name: req.body.name,
      password: req.body.password,
      email: req.body.email
    });
    santa.password = await bcrypt.hash(santa.password, 10);
    await santa.save();
    const token = santa.generateAuthToken();
    res.header("x-auth-token", token).send({
      _id: santa._id
    });
    // check the order
    const promises = Array.from(subscriptions.values()).map(sub =>
      webPush.sendNotification(sub, "Hola.")
    );
    await Promise.all(promises);
  });

  app.get(route + "/purge", async (req, res) => {
    const santas = await Santa.deleteMany({});
    res.send({
      msg: `Delete ${santas.deletedCount} santa's`
    });
  });

  app.get(route + "/seed", async (req, res) => {
    const santas = [];
    for (let i = 0; i < 5; i++) {
      santas.push({
        name: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.random.alphaNumeric(10)
      });
    }
    const docs = await Santa.insertMany(santas);
    res.send({
      msg: docs.length
    });
  });
};
