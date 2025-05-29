const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const color = require("colors");
const limiter = require("./middleware/ratelimit.js");
const userRouter = require("./router/user.router.js");
const fileRouter = require("./router/file.router.js");
const MongoDB = require("./config/db.config.js");
const app = express();

app.use( 
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
dotenv.config();
app.use(limiter);

const Port = process.env.PORT;
MongoDB();

app.use("/api/v1/users", userRouter); //user route
app.use("/api/v1/file", fileRouter); //file route

app.listen(Port, () => {
  console.log("server running on port number".cyan, Port.cyan);
});
