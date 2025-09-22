const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,

      minLength: 2,
      maxLength: 50,
      trim: true,
      index: true,
    },
    lastName: {
      type: String,
      minLength: 2,
      maxLength: 50,
      trim: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: 2,
      maxLength: 90,

      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("\nemail is Invalid!.." + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("\nPassword is Invalid!.." + value);
        }
      },
    },
    age: {
      type: Number,
      min: 18,
      trim: true,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("\nGender Doesn't match with the options!");
        }
      },
    },
    photoUrl: {
      type: String,
      default: "https://avatars.githubusercontent.com/u/192607541?v=4",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("\nphotoURL is Invalid!.." + value);
        }
      },
    },
    about: {
      type: String,
      default: "This is a default about me section.",
      trim: true,
      maxLength: 500,
    },
    skills: {
      type: [String],
      trim: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (!this.photoUrl) {
    this.photoUrl =
      "https://upload.wikimedia.org/wikipedia/commons/7/72/Default-welcomer.png";
  }
  next();
});

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  return token;
};

userSchema.methods.PasswordValidate = async function (passwordInputByUser) {
  const user = this;
  //console.log(user);
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );
  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
