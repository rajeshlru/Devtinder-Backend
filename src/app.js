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
    origin: ["https://tinder-devs.netlify.app", "http://localhost:5173"],
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

app.get("/admin/test-reengagement/:email", async (req, res) => {
  try {
    const user = await User.findOne({ emailId: req.params.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndUpdate(user._id, {
      lastActive: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    });

    const emailSent = await cronService.sendReengagementEmail2(user, 5);

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

app.post("/test-new-year-email", async (req, res) => {
  try {
    const testEmail = "rajeshelluru143@gmail.com";
    const firstName = "Rajesh";

    const result = await cronService.sendNewYearWishEmail(firstName, testEmail);

    res.json({
      success: true,
      message: "New Year Wish email sent to rajeshelluru143@gmail.com",
      result: result,
    });
  } catch (error) {
    console.error("New Year email test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test Day 1 Onboarding Email
app.post("/test-day1-onboarding", async (req, res) => {
  try {
    const testEmail = "rajeshelluru143@gmail.com";
    const firstName = "Rajesh";

    const result = await cronService.sendDay1OnboardingEmail(
      firstName,
      testEmail
    );

    res.json({
      success: true,
      message: "Day 1 Onboarding email sent to rajeshelluru143@gmail.com",
      result: result,
    });
  } catch (error) {
    console.error("Day 1 onboarding test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test Day 2 Onboarding Email
app.post("/test-day2-onboarding", async (req, res) => {
  try {
    const testEmail = "rajeshelluru143@gmail.com";
    const firstName = "Rajesh";

    const result = await cronService.sendDay2OnboardingEmail(
      firstName,
      testEmail
    );

    res.json({
      success: true,
      message: "Day 2 Onboarding email sent to rajeshelluru143@gmail.com",
      result: result,
    });
  } catch (error) {
    console.error("Day 2 onboarding test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test Day 3 Onboarding Email
app.post("/test-day3-onboarding", async (req, res) => {
  try {
    const testEmail = "rajeshelluru143@gmail.com";
    const firstName = "Rajesh";

    const result = await cronService.sendDay3OnboardingEmail(
      firstName,
      testEmail
    );

    res.json({
      success: true,
      message: "Day 3 Onboarding email sent to rajeshelluru143@gmail.com",
      result: result,
    });
  } catch (error) {
    console.error("Day 3 onboarding test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test Re-engagement Email 1
app.post("/test-reengagement-1", async (req, res) => {
  try {
    const testEmail = "rajeshelluru143@gmail.com";
    const testUser = {
      firstName: "Rajesh",
      emailId: testEmail,
      _id: "65a1b2c3d4e5f67890123456",
      lastActive: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    };

    const result = await cronService.sendReengagementEmail1(testUser);

    res.json({
      success: true,
      message: "Re-engagement Email 1 sent to rajeshelluru143@gmail.com",
      result: result,
    });
  } catch (error) {
    console.error("Re-engagement 1 test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test Re-engagement Email 2
app.post("/test-reengagement-2", async (req, res) => {
  try {
    const testEmail = "rajeshelluru143@gmail.com";
    const testUser = {
      firstName: "Rajesh",
      emailId: testEmail,
      _id: "65a1b2c3d4e5f67890123456",
      lastActive: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    };

    const result = await cronService.sendReengagementEmail2(testUser, 5); // 5 new connections

    res.json({
      success: true,
      message: "Re-engagement Email 2 sent to rajeshelluru143@gmail.com",
      result: result,
    });
  } catch (error) {
    console.error("Re-engagement 2 test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test Re-engagement Email 3
app.post("/test-reengagement-3", async (req, res) => {
  try {
    const testEmail = "rajeshelluru143@gmail.com";
    const testUser = {
      firstName: "Rajesh",
      emailId: testEmail,
      _id: "65a1b2c3d4e5f67890123456",
      lastActive: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    };

    const result = await cronService.sendReengagementEmail3(testUser);

    res.json({
      success: true,
      message: "Re-engagement Email 3 sent to rajeshelluru143@gmail.com",
      result: result,
    });
  } catch (error) {
    console.error("Re-engagement 3 test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test Weekly Digest Email
app.post("/test-weekly-digest", async (req, res) => {
  try {
    const testEmail = "rajeshelluru143@gmail.com";
    const testUser = {
      firstName: "Rajesh",
      emailId: testEmail,
      _id: "65a1b2c3d4e5f67890123456",
      lastActive: new Date(),
    };

    const result = await cronService.sendWeeklyDigestEmail(testUser);

    res.json({
      success: true,
      message: "Weekly Digest email sent to rajeshelluru143@gmail.com",
      result: result,
    });
  } catch (error) {
    console.error("Weekly digest test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test Inactive User Reminder
app.post("/test-inactive-reminder", async (req, res) => {
  try {
    const testEmail = "rajeshelluru143@gmail.com";
    const testUser = {
      firstName: "Rajesh",
      emailId: testEmail,
      _id: "65a1b2c3d4e5f67890123456",
      lastActive: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    };

    const result = await cronService.sendInactiveUserReminder(testUser);

    res.json({
      success: true,
      message: "Inactive User Reminder sent to rajeshelluru143@gmail.com",
      result: result,
    });
  } catch (error) {
    console.error("Inactive reminder test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test User Weekly Digest Email
app.post("/test-user-weekly-digest", async (req, res) => {
  try {
    const testEmail = "rajeshelluru143@gmail.com";
    const testUser = {
      firstName: "Rajesh",
      emailId: testEmail,
      _id: "65a1b2c3d4e5f67890123456",
      lastActive: new Date(),
    };

    const result = await cronService.sendUserWeeklyDigest(testUser);

    res.json({
      success: true,
      message: "User Weekly Digest email sent to rajeshelluru143@gmail.com",
      result: result,
    });
  } catch (error) {
    console.error("User weekly digest test error:", error);
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
