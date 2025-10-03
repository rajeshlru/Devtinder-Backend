const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const User = require("../modules/user");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of data
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

    // Encrypting password by bcrypt
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
  try {
    emailId = emailId.toLowerCase();
    const user = await User.findOne({ emailId: emailId }).collation({
      locale: "en",
      strength: 3,
    });

    if (!user) {
      throw new Error("Email is not valid");
    }

    const isPasswordMatch = await user.PasswordValidate(password);
    if (isPasswordMatch) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        expires: new Date(Date.now() + 96 * 3600000), // 96 hours
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });

      res.json({ message: "Login Successful!", data: user });
    } else {
      throw new Error("Password is incorrect");
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout succesfully!...");
});
module.exports = authRouter;
