// // models/Message.js
// const mongoose = require("mongoose");

// const messageSchema = new mongoose.Schema(
//   {
//     text: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     sender: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     receiver: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     chatRoom: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     messageType: {
//       type: String,
//       enum: ["text", "image", "file", "system"],
//       default: "text",
//     },
//     status: {
//       type: String,
//       enum: ["sent", "delivered", "read"],
//       default: "sent",
//     },
//     timestamp: {
//       type: Date,
//       default: Date.now,
//     },
//     readBy: [
//       {
//         userId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User",
//         },
//         readAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// );

// // Index for faster queries
// messageSchema.index({ chatRoom: 1, timestamp: 1 });
// messageSchema.index({ sender: 1, receiver: 1 });
// messageSchema.index({ timestamp: -1 });

// module.exports = mongoose.model("Message", messageSchema);

// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatRoom: {
      type: String,
      required: true,
      index: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
messageSchema.index({ chatRoom: 1, timestamp: 1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ timestamp: -1 });

module.exports = mongoose.model("Message", messageSchema);
