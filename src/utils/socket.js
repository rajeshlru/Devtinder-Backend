const socket = require("socket.io");
const Message = require("../modules/Message"); // Import Message model
const User = require("../modules/user");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

// Generate consistent hash for roomId
const generateRoomHash = (userId, targetUserId) => {
  const roomId = [userId, targetUserId].sort().join("$@#");
  return crypto.createHash("sha256").update(roomId).digest("hex");
};

const codeSessions = new Map();
const userSessions = new Map();

const initialiseSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const connectedUsers = new Map();
  const userRooms = new Map();

  io.on("connection", (socket) => {
    //console.log(`✅ New client connected: ${socket.id}`);

    socket.on("joinChat", async ({ firstName, userId, targetUserId }) => {
      if (!userId || !targetUserId) {
        console.warn(`❌ joinChat failed: Missing IDs from ${socket.id}`);
        return;
      }

      const roomId = generateRoomHash(userId, targetUserId);
      // console.log(`🙋‍♂️ ${firstName} (${userId}) joined room: ${roomId}`);

      // Store user connection
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      userRooms.set(userId, roomId);
      socket.join(roomId);

      // Send chat history when user joins
      try {
        const messages = await Message.find({
          chatRoom: roomId,
        })
          .populate("sender", "firstName lastName photoUrl")
          .populate("receiver", "firstName lastName photoUrl")
          .sort({ timestamp: 1 })
          .limit(100); // Last 100 messages

        socket.emit("chatHistory", messages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }

      // Notify room
      socket.to(roomId).emit("userJoined", { userId, firstName });

      // Broadcast online status
      socket.broadcast.emit("userWentOnline", {
        userId: userId,
        isOnline: true,
      });
    });

    socket.on(
      "sendMessage",
      async ({ firstName, userId, targetUserId, text }) => {
        // console.log("🚀 Receiving sendMessage:", {
        //   firstName,
        //   userId,
        //   targetUserId,
        //   text,
        // });

        if (!firstName || !userId || !targetUserId || !text) {
          console.warn("❌ Missing required fields in sendMessage");
          return;
        }

        const roomId = generateRoomHash(userId, targetUserId);

        try {
          // Save message to database with proper error handling
          const newMessage = new Message({
            text: text.trim(),
            sender: userId,
            receiver: targetUserId,
            chatRoom: roomId,
            messageType: "text",
            status: "sent",
            timestamp: new Date(),
          });

          const savedMessage = await newMessage.save();

          // Populate sender and receiver info before emitting
          const populatedMessage = await Message.findById(savedMessage._id)
            .populate("sender", "firstName lastName photoUrl")
            .populate("receiver", "firstName lastName photoUrl");

          // console.log(`💬 Message saved to DB: ${savedMessage._id}`);

          // Emit to room with full populated message data
          io.to(roomId).emit("messageReceived", {
            _id: populatedMessage._id,
            text: populatedMessage.text,
            userId: populatedMessage.sender._id,
            firstName: populatedMessage.sender.firstName,
            sender: populatedMessage.sender,
            receiver: populatedMessage.receiver,
            timestamp: populatedMessage.timestamp,
            status: populatedMessage.status,
            type: populatedMessage.messageType,
          });
        } catch (error) {
          console.error("❌ Error saving message to database:", error);
          // Emit error back to sender with more details
          socket.emit("messageError", {
            error: "Failed to send message - please try again",
            originalText: text,
          });
        }
      }
    );

    // Mark messages as read
    socket.on("markMessagesAsRead", async ({ userId, targetUserId }) => {
      try {
        const roomId = generateRoomHash(userId, targetUserId);

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

        // Notify sender that messages were read
        socket.to(roomId).emit("messagesRead", {
          readerId: userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Get chat history
    socket.on(
      "getChatHistory",
      async ({ targetUserId, page = 1, limit = 50 }) => {
        if (!socket.userId || !targetUserId) return;

        const roomId = generateRoomHash(userId, targetUserId);

        try {
          const messages = await Message.find({
            chatRoom: roomId,
          })
            .populate("sender", "firstName lastName photoUrl")
            .populate("receiver", "firstName lastName photoUrl")
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

          socket.emit("chatHistory", messages.reverse()); // Reverse to get chronological order
        } catch (error) {
          console.error("Error fetching chat history:", error);
          socket.emit("chatHistoryError", { error: "Failed to load messages" });
        }
      }
    );

    // Your existing typing and online status events remain the same...
    socket.on("typing", (data) => {
      const { userId, targetUserId } = data;
      if (!userId || !targetUserId) return;
      const roomId = generateRoomHash(userId, targetUserId);
      // Join the room first to ensure proper targeting
      socket.join(roomId);
      // Emit to everyone in the room EXCEPT the sender
      socket.to(roomId).emit("typing", { userId });
    });

    socket.on("stopTyping", (data) => {
      const { userId, targetUserId } = data;
      if (!userId || !targetUserId) return;
      const roomId = generateRoomHash(userId, targetUserId);

      // Join the room first to ensure proper targeting
      socket.join(roomId);
      // Emit to everyone in the room EXCEPT the sender
      socket.to(roomId).emit("stopTyping", { userId });
    });

    socket.on("userOnline", (data) => {
      // Broadcast to all connected clients except sender
      socket.broadcast.emit("userWentOnline", {
        userId: data.userId,
        isOnline: true,
      });
    });

    socket.on("userOffline", (data) => {
      // Broadcast to all connected clients except sender
      socket.broadcast.emit("userWentOffline", {
        userId: data.userId,
        isOnline: false,
        lastSeen: data.lastSeen || new Date().toISOString(),
      });
    });
    const onlineUsers = new Map();
    const getUserOnlineStatus = (userId) => {
      return onlineUsers.has(userId);
    };

    const getLastSeen = (userId) => {
      const user = onlineUsers.get(userId);
      return user ? user.lastSeen : null;
    };

    socket.on("getUserOnlineStatus", (data) => {
      const { targetUserId } = data;
      if (!targetUserId) return;

      const isOnline = getUserOnlineStatus(targetUserId);
      const lastSeen = getLastSeen(targetUserId);

      // console.log(`📡 Sending online status for ${targetUserId}:`, {
      //   isOnline,
      //   lastSeen,
      // });

      socket.emit("userOnlineStatus", {
        userId: targetUserId,
        isOnline: isOnline,
        lastSeen: isOnline ? null : lastSeen,
      });
    });

    socket.on("disconnect", async (reason) => {
      //console.log(`❌ Client disconnected: ${socket.id}`, reason);

      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        userRooms.delete(socket.userId);

        socket.broadcast.emit("userWentOffline", {
          userId: socket.userId,
          isOnline: false,
          lastSeen: new Date().toISOString(),
        });
      }
    });
  });

  return io;
};

module.exports = initialiseSocket;
