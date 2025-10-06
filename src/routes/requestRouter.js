const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../modules/connectionRequest");
const User = require("../modules/user");
const {
  sendConnectionRequestEmail,
  sendContactFormEmail,
} = require("../utils/mailer");

//igonored, interested

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: status + " is Invalid Status Type" });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        return res.status(400).json({ message: "Connection already exists" });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({ message: "User not found" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      await connectionRequest.save();

      let emailSent = false;

      if (status === "interested" && toUser.emailId) {
        emailSent = await sendConnectionRequestEmail(toUser, req.user, status);
      } else if (status === "interested") {
        console.log("Recipient email missing or invalid:", toUser);
      }

      if (emailSent) {
        res.json(
          `You (${req.user.firstName}) sent a connection request to ${toUser.firstName} ${toUser.lastName} and the user was notified via email.`
        );
      } else {
        res.json(
          `You (${req.user.firstName}) sent a connection request to ${toUser.firstName} ${toUser.lastName}. Email notification could not be sent.`
        );
      }
    } catch (error) {
      console.log("Route error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

//reject, accept

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;

      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: status + " is Invalid Status Type" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res.status(404).json({ error: "Connection request not found" });
      }
      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.status(200).json({ message: `Request ${status} successfully`, data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

//contact send email

requestRouter.post("/send-email", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message, photoUrl } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: firstName, lastName, email, message",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const emailSent = await sendContactFormEmail({
      firstName,
      lastName,
      email,
      phone,
      message,
      photoUrl,
    });

    if (emailSent) {
      res.json({ success: true, message: "Email sent successfully" });
    } else {
      res.status(500).json({ success: false, message: "Failed to send email" });
    }
  } catch (error) {
    console.error("Error in /api/send-email route:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = requestRouter;
