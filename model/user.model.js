const { response } = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);
const userModel = {
  checkExist: async (email) => {
    const exist = await User.findOne({ email });

    if (exist) {
      return new Error("Email already taken!");
    }
    return true;
  },
  createUser: async (username, email, password) => {
    await userModel.checkExist(email);
    const result = await User.insertOne({ username, email, password });
  },
  signinUser: async (email, password) => {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        return user;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error("Error during sign in");
    }
  },
  generateJWT: async (email, password) => {
    const secret_key = process.env.JWT_SECRET;
    return jwt.sign({ email: email, password: password }, secret_key, {
      expiresIn: "1d",
    });
  },
};

module.exports = userModel;
