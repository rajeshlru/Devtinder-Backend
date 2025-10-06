const express = require("express");
const router = express.Router();
const Message = require("../modules/Message");
const auth = require("../middleware/auth");

router.get("/history/:targetUserId", auth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const roomId = [userId, targetUserId].sort().join("-");

    const messages = await Message.find({
      chatRoom: roomId,
    })
      .populate("sender", "firstName lastName photoUrl")
      .populate("receiver", "firstName lastName photoUrl")
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalMessages = await Message.countDocuments({ chatRoom: roomId });

    res.json({
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to load messages" });
  }
});

router.put("/mark-read/:targetUserId", auth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    const roomId = [userId, targetUserId].sort().join("-");

    await Message.updateMany(
      {
        chatRoom: roomId,
        receiver: userId,
        status: { $ne: "read" },
      },
      {
        $set: { status: "read" },
        $push: {
          readBy: {
            userId: userId,
            readAt: new Date(),
          },
        },
      }
    );

    res.json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

router.delete("/:messageId", auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOneAndDelete({
      _id: messageId,
      sender: userId, // Only sender can delete
    });

    if (!message) {
      return res
        .status(404)
        .json({ error: "Message not found or unauthorized" });
    }

    res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

module.exports = router;
