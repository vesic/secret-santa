const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const SantaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255
  },
  registration: {
    type: String
  }
});

SantaSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email
    },
    process.env.MY_KEY
  );
  return token;
};

const Santa = mongoose.model("Santa", SantaSchema);

function validateSanta(santa) {
  const schema = {
    name: Joi.string()
      .min(3)
      .max(50)
      .required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(3)
      .max(255)
      .required(),
    registration: Joi.string()
  };
  return Joi.validate(santa, schema);
}

exports.Santa = Santa;
exports.validate = validateSanta;
