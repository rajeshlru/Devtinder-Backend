const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieparser = require("cookie-parser");
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");
const userRouter = require("./routes/user");
const cors = require("cors");
require("dotenv").config();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://devtinder-backend-bh5g.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(cookieparser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("Mongo DB Connected succesfully");
    app.listen(process.env.PORT, () => {
      console.log("server is successfully running on port 7777...");
    });
  })
  .catch((error) => console.log("MongoDB cant Conneceted", error));
