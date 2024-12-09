const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    // unique: true, // Removed unique constraint from username
    minlength: 5,
    maxlength: 30,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Assuming a minimum length for password
  },
  isApproved: {
    type: Boolean,
    default: false, // Set default value to false
  },
});

const validate = (data) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(5).max(30).required(),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    password: Joi.string().min(6).required(), // Assuming a minimum length for password
  });

  return schema.validate(data);
  
};

const userModel = mongoose.model("Users", userSchema);
module.exports = { userModel, validate };