const bcrypt = require("bcrypt");
const userModel = require("../model/user.model");

const User = {
  Signup: async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    try {
      await userModel.createUser(username, email, hashedPassword);
      const token = await userModel.generateJWT(email, hashedPassword);
      res.cookie("token", token, { maxAge: 3600000, httpOnly: true });
      res
        .status(201)
        .json({ data: token, message: "user created successfully!" });
    } catch (error) {
      res.status(400).json({
        message: "Email already taken or user entered invalid credentials!",
      });
    }
  },
  Signin: async (req, res) => {
    const { email, password } = req.body;

    try {
      // DON'T hash the password here - just pass the plain password
      const user = await userModel.signinUser(email, password);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = await userModel.generateJWT(email);

      res.cookie("token", token, {
        maxAge: 3600000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      res.status(200).json({
        data: token,
        message: "User logged in successfully!",
      });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(401).json({ message: "Invalid credentials" });
    }
  },
  Signout: (req, res) => {
    res.cookie("token", " ", { httpOnly: true, maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  },
};

module.exports = User;
