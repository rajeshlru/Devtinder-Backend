const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const User = require("../modules/user");
const { sendWelcomeEmail } = require("../utils/mailer");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);

    const {
      firstName,
      lastName,
      emailId,
      password,
      skills,
      age,
      gender,
      photoUrl,
    } = req.body;

    const passwordHash = await bcrypt.hash(password, 11);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      skills,
      age,
      gender,
      photoUrl,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 96 * 3600000), // 96 hours
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    sendWelcomeEmail(firstName, lastName, emailId)
      .then(() => {
        console.log("Welcome email triggered successfully");
      })
      .catch((err) => {
        console.log("Welcome email failed:", err);
      });

    res.json({ message: "User added successfully!", data: savedUser });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.emailId) {
      // Duplicate email error
      return res.status(400).send("Email already exists.");
    }

    res.status(500).send(error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  let { emailId, password } = req.body;
  if (!emailId || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailId)) {
    return res.status(400).json({
      message: "Email is not valid",
    });
  }
  try {
    emailId = emailId.toLowerCase();
    const user = await User.findOne({ emailId: emailId }).collation({
      locale: "en",
      strength: 3,
    });

    if (!user) {
      return res.status(404).json({
        message: "Email is not registered",
      });
    }

    const isPasswordMatch = await user.PasswordValidate(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Password is incorrect",
      });
    }

    const token = await user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 96 * 3600000), // 96 hours
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.json({
      message: "Login Successful!",
      data: user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error during login",
    });
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout succesfully!...");
});
module.exports = authRouter;
