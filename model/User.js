const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const joi = require("@hapi/joi");

const secrets = process.env.JWT_SECRET;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verification_token: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

userSchema.method.authenthication = function () {
  jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
    },
    secrets
  );
};

const User = mongoose.model("User", userSchema);

function validation(user) {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required().min(5),
    confirmPassword: joi.string().required().min(5),
    name: joi.string().required(),
  });
  return schema.validate(user);
}

function validateLogin(user) {
  const schema = joi.object({
    username: joi.string().email().required(),
    password: joi.string().required().min(5),
  });
  return schema.validate(user);
}
module.exports = {
  validation,
  validateLogin,
  User,
};
