const { response } = require("express")
const mongoose=require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt=require("bcrypt")

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
 
const User = mongoose.model("Title-check", userSchema);
const userModel = {
    checkExist: async (email) => {
        const exist = await User.findOne({email});
        
        if (exist) {
            return new Error("Email already taken!")
        }
        return true;
        
    },
    createUser: async(username, email, password) => {
        await userModel.checkExist(email);
        const result = await User.insertOne({ username, email, password });
        
        
    },
    signinUser: async (email, password) => {
        const user = await User.findOne({ email });
        if (user && bcrypt.compare(password, user.password)) {
            return user;
        }
        else {
            return new Error("User is not invalid");
        }
    },
    generateJWT: async (email, password) => {
       secret_key = process.env.JWT_SECRET;
       return jwt.sign({ email, password }, secret_key, { expiresIn: "1d" })
        
    }
}

module.exports = userModel;