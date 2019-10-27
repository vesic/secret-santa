const auth = require("./auth");
const bcrypt = require("bcryptjs");
const { Santa, validate } = require("../models/santa");
const express = require("express");
const router = express.Router();
const faker = require("faker");

router.get("/current", auth, async (req, res) => {
  const santa = await Santa.findById(req.santa._id).select("-password");
  res.send(santa);
});

router.get("/", async (req, res) => {
  const santas = await Santa.find({});
  res.send({ data: santas });
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let santa = await Santa.findOne({ email: req.body.email });
  if (santa) return res.status(400).send("Santa already registered");
  santa = new Santa({
    name: req.body.name,
    password: req.body.password,
    email: req.body.email
  });
  santa.password = await bcrypt.hash(santa.password, 10);
  await santa.save();
  const token = santa.generateAuthToken();
  res.header("x-auth-token", token).send({
    _id: santa._id,
    name: santa.name,
    email: santa.email
  });
});

router.get("/purge", async (req, res) => {
  const santas = await Santa.deleteMany({});
  res.send({
    msg: `Delete ${santas.deletedCount} santa's`
  });
});

router.get("/seed", async (req, res) => {
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

module.exports = router;
