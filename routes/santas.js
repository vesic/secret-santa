const faker = require("faker");
const bcrypt = require("bcryptjs");
const auth = require("./auth");
const { Santa, validate } = require("../models/santa");
const { subscriptions, santas } = require("../shared");

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
      email: req.body.email,
      registration: JSON.stringify(subscriptions.get(req.body.registration))
    });
    santa.password = await bcrypt.hash(santa.password, 10);
    const santas = await Santa.find({});
    await santa.save();
    const token = santa.generateAuthToken();
    // todo: ?delete
    // add santa to event participants
    // note this is different than subscriptions array
    // santas.push(santa);
    res.header("x-auth-token", token).send({
      _id: santa._id
    });
    // todo: is next block ok to call after res.send
    const promises = santas.map(current =>
      webPush.sendNotification(JSON.parse(current.registration), JSON.stringify({
        data: santa,
        type: "registration",
      }))
    );
    await Promise.all(promises);
  });

  // todo: this is workaround
  // shoud be examined & removed
  app.post(route + "/log-out", async (req, res) => {
    let id = req.body.id;
    if (!id) req.send({ error: 'No id!' });
    let santa = await Santa.findById(id);
    santa.registration = undefined;
    santa.save();
    res.send({
      message: "Santa registration removed."
    })
  });

  // utility routes
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

