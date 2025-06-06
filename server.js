const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const color = require("colors");
const limiter = require("./middleware/ratelimit.js");
const userRouter = require("./router/user.router.js");
const fileRouter = require("./router/file.router.js");
const MongoDB = require("./config/db.config.js");
const cookieParser = require("cookie-parser");
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.0.113:5173",
      "http://localhost:5000",
      "http://192.168.0.113:5000",
      "https://title-check-backend.onrender.com",
      "https://title-check-frontend.onrender.com",
      "https://title-check-frontend.vercel.app"
    ],
    credentials: true,
  })
); 
app.use(express.json());
dotenv.config(); 
app.use(limiter);  
app.use(cookieParser());
const Port = process.env.PORT;
MongoDB();
 
app.use("/api/v1/users", userRouter); //user route
app.use("/api/v1/file", fileRouter); //file route

app.get('/', (req,res) => {
    res.send("server working");
})

app.listen(Port,'0.0.0.0',() => {
  console.log("server running on port number".cyan, Port.cyan);
});

