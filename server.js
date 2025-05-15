const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const Router = require("./src/router/user.router")
const app = express()


app.use(cors())
dotenv.config()
const Port = process.env.Port;

app.use("/api/v1/users",Router)

app.listen(3001 || Port, () => {
    console.log("server running on port number", Port)
    
}
) 