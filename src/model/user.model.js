const { response } = require("express")
const jwt = require("jsonwebtoken")

const userModel = {
    checkExist: (email) => {
        const exist= new Promise((resolve,reject) => {
            
        })
    },
    createUser: (username, email, password) => {
        if (exist) {
            return new Error
        }
        return new Promise((resolve, reject) => {
            
        })
    },
    signinUser: (email,password) => {
        return new Promise((resolve,reject) => {
            
        })
    },
    generateJWT: async (email, password) => {
       seret_key = process.env.JWT_SECRET;
       return jwt.sign({ email, password }, secret_key, { expiresIn: "1d" })
        
    }
}

module.exports = userModel;