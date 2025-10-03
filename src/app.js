const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieparser = require("cookie-parser");
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");
const userRouter = require("./routes/user");
const cors = require("cors");
const http = require("http");
const initialiseSocket = require("./utils/socket");
require("dotenv").config();
const cronService = require("./utils/cronService");
const User = require("./modules/user");

app.use(
  cors({
    origin: "http://localhost:5173",
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

cronService.init();

app.get("/admin/cron-status", (req, res) => {
  res.json({
    success: true,
    message: "Cron service is running",
    serverTime: new Date().toISOString(),
    jobs: "New Year & Onboarding emails",
  });
});

app.get("/admin/check-users", async (req, res) => {
  try {
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "firstName emailId createdAt onboardingDay1Sent onboardingDay2Sent onboardingDay3Sent"
      );

    res.json({
      success: true,
      users: recentUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/admin/test-day1/:email", async (req, res) => {
  try {
    const user = await User.findOne({ emailId: req.params.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const emailSent = await cronService.sendDay1OnboardingEmail(
      user.firstName,
      user.emailId
    );

    res.json({
      success: true,
      emailSent: emailSent,
      message: emailSent ? "Day 1 email sent manually" : "Failed to send email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test Re-engagement Campaign
app.get("/admin/test-reengagement/:email", async (req, res) => {
  try {
    const user = await User.findOne({ emailId: req.params.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Simulate inactive user by updating lastActive
    await User.findByIdAndUpdate(user._id, {
      lastActive: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
    });

    const emailSent = await cronService.sendReengagementEmail2(user, 5); // Simulate 5 new connections

    res.json({
      success: true,
      emailSent,
      message: emailSent
        ? "Re-engagement email sent! Check inbox."
        : "Failed to send email",
      testData: {
        user: user.emailId,
        simulatedInactivity: "35 days",
        simulatedConnections: 5,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

process.on("SIGINT", () => {
  console.log("🛑 Shutting down gracefully...");
  cronService.stopAll();
  process.exit(0);
});

const server = http.createServer(app);
initialiseSocket(server);

connectDB()
  .then(() => {
    console.log("Mongo DB Connected succesfully");
    server.listen(process.env.PORT, () => {
      console.log("server is successfully running on port 7777...");
    });
  })
  .catch((error) => console.log("MongoDB cant Conneceted", error));
