const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../modules/connectionRequest");
const userRouter = express.Router();
const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";
const User = require("../modules/user");

userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    if (!connectionRequest) {
      return res.send(
        "Hey! " + loggedInUser.firstName + " you dont have any pending requests"
      );
    }

    res.json({
      message: "Data fetched Successfully",
      connectionRequest,
    });
  } catch (err) {
    res.status(403).send("Error:" + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    if (!req.user) {
      return res.status(400).send("User not authenticated");
    }
    const connectionRequest = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequest
      .map((row) => {
        const fromUser = row.fromUserId;
        const toUser = row.toUserId;

        if (!fromUser || !toUser) return null;

        if (fromUser._id.toString() === loggedInUser._id.toString()) {
          return toUser;
        }
        return fromUser;
      })
      .filter(Boolean);

    res.json({ data });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUserFromFeed = new Set();

    connectionRequests.forEach((req) => {
      hideUserFromFeed.add(req.fromUserId.toString());
      hideUserFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({
      message: "Feed fetched successfully",
      count: users.length,
      users,
    });
  } catch (err) {
    res.status(403).send("Error:" + err.message);
  }
});

module.exports = userRouter;
