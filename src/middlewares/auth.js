const jwt = require("jsonwebtoken");
const User = require("../modules/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login!..");
    }
    const decodedMessage = await jwt.verify(token, process.env.JWT_SECRET);
    //console.log(decodedMessage);
    const { _id } = decodedMessage;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("Invalid Credentails:" + error.message);
    }
    req.user = user;
    //console.log(user);
    next();
  } catch (error) {
    console.error("User not Found " + error.message);
  }
};

module.exports = { userAuth };
