const bcrypt= require("bcrypt")

const User = {
    Signup: async (req,res) => {
        const { username, email, password } = req.body;
        try {
            const existance = await userModel.checkExist(email);
            if (existance) {
                res.status(400).json({message:"user already taken in this email"})
            }
            const hashedPassword = bcrypt.hash(password, 12);
            const response = await userModel.createUser(username, email, hashedPassword);
            if (!response) {
                res.status(400).json({ message: "Error occured in account creation" });
            }
            res.status(201).json({message:"user created successfully!"})
        } catch (error) {
            res.status(400).json({ message: "Error creating a user" }) 
        }
    },
    Signin: async(req,res) => {
        const { email, password } = req.body;
        const hashedPassword = bcrypt.hash(password, 12);
        try {
            const response = await userModel.signinUser(email, hashedPassword);
            if (!response) {
                res.status(400).json({ message: "Error in user login" })
            }
            res.status(200).json({message: "user logged in successfully!"})
        } catch (error) {
            res.status(400).json({message:"Error while user trying to login"})
        }
    }
}

module.exports= User;