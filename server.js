const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const color = require("colors");
const userRouter = require("./src/router/user.router")
const fileRouter = require("./src/router/file.router.js")
const MongoDB = require("./config/db.config.js")
const app = express()
 

app.use(cors())
app.use(express.json())
dotenv.config()
MongoDB();
const Port = process.env.Port; 

app.use("/api/v1/users", userRouter); //uesr route
app.use("/api/v1/file", fileRouter); //file route


app.listen(5000 || Port, () => {
    console.log("server running on port number".blue, Port.cyan)
    
}
) 