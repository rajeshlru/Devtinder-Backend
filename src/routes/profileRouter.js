const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const validate = require("validator");
const User = require("../modules/user");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send("Failed due to " + error.message);
  }
});

profileRouter.put("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Updates not available for given fields");
    }
    const loggedInUser = req.user;

    //console.log(loggedInUser);

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    //console.log(loggedInUser);

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName},your Profile was Updated Successfully`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("Failed due to " + err.message);
  }
});

profileRouter.put("/profile/password", userAuth, async (req, res) => {
  try {
    const { currentpassword, newpassword } = req.body;
    if (!currentpassword || !newpassword) {
      throw new Error("Both current and new password are required");
    }
    const ismatch = await bcrypt.compare(currentpassword, req.user.password);
    if (!ismatch) {
      throw new Error("Your Current password is Incoorect");
    }
    if (!validate.isStrongPassword(newpassword)) {
      throw new Error("Please provide a Stong Password");
    }

    const newpasswordHash = await bcrypt.hash(newpassword, 11);

    req.user.password = newpasswordHash;

    await req.user.save();

    res.send(`${req.user.firstName},your Password was Updated Successfully`);
  } catch (err) {
    res.status(400).send("Error:" + err.message);
  }
});

profileRouter.delete("/delete/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() !== id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own account" });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.clearCookie("token");
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = profileRouter;
