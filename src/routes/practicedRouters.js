// app.get(
//   "/home",
//   [
//     (req, res, next) => {
//       console.log("Middleware 1 executed");
//       //res.send("Response 1!");
//       next();
//     },
//     (req, res, next) => {
//       console.log("Middleware 2 executed");
//       //res.send("Response 2!");
//       next();
//     },
//   ],
//   (req, res, next) => {
//     console.log("Middleware 3 executed");
//     //res.send("Response 3!");
//     next();
//   },
//   (req, res, next) => {
//     console.log("Middleware 4 executed");
//     //res.send("Response 4!");
//     next();
//   },
//   [
//     (req, res) => {
//       console.log("Last Response");
//       res.send("Response 5!");
//     },
//   ]
// );

// app.get("/about", (req, res, next) => {
//   console.log("Middleware 1 About Page");
//   //res.send("Response 1!");
//   next();
// });

// app.get("/about", (req, res, next) => {
//   console.log("Middleware 2 About Page");
//   //res.send("Response 2!");
//   next();
// });

// app.get("/about", (req, res, next) => {
//   console.log("Middleware 3 About Page");
//   res.send("Response 3!");
//   next();
// });

// app.get("/about", (req, res, next) => {
//   console.log("Middleware 4 About Page");
//   //res.send("Response 4!");
// });

// app.use("/home", (req, res) => {
//   res.send("This is about Home Page!");
// });

// // app.get("/user", (req, res) => {
// //   console.log(req.query);
// //   res.send({ firstname: "Rajesh", lastname: "Elluru" });
// // });

// app.get("/user/:userId/:name/:password", (req, res) => {
//   console.log(req.params);
//   res.send({ firstname: "Rajesh", lastname: "Elluru" });
// });

// app.post("/user", (req, res) => {
//   res.send("User Data has been posted successfully!");
// });

// app.patch("/user", (req, res) => {
//   res.send("User Data has been updated successfully!");
// });

// app.delete("/user", (req, res) => {
//   res.send("User Data has been deleted successfully!");
// });

// app.use("/user", (req, res) => {
//   res.send("This is about User Page!");
// });

// const { adminAuth, userAuth } = require("./middlewares/auth");

// app.use("/admin", adminAuth);

// app.get("/admin", (req, res) => {
//   res.send("Admin ..........");
// });

// app.get("/admin/getuser", (req, res) => {
//   res.send("Admin GET request successful!");
// });

// app.get("/admin/deluser", (req, res) => {
//   res.send("Admin DELETE request successful!");
// });

// // app.use("/user", userAuth);

// // app.get("/user/getuser", (req, res) => {
// //   res.send("User ..........");
// // });

// //or

// app.get("/user", userAuth, (req, res) => {
//   res.send("User GET request successful!");
// });

// app.use("/getuser", (req, res) => {
//   try {
//     throw new Error("This is an error from getuser route!");
//     res.send("Get User Request Successful!");
//   } catch (error) {
//     //throw new Error("This is an error from getuser route!");
//     console.error("Error occurred:", error.message);
//     res.status(500).send("An error occurred while processing your request.");
//   }
// });

// app.use("/", (err, req, res, next) => {
//   res.status(500).send("Something went wrong! ");
// });

// app.get("/findid", async (req, res) => {
//   const userid = req.body.userId;
//   try {
//     const users = await User.findById(userid);
//     res.send(users);
//   } catch (error) {
//     res.status(400).send("Something went wrong");
//   }
// });

// app.get("/user", async (req, res) => {
//   const userEmail = req.body.emailId;
//   try {
//     //const user = await User.findOne({ emailId: userEmail });
//     const user = await User.find({ emailId: userEmail });
//     if (user.length === 0) {
//       res.send("User not found");
//     } else {
//       res.send(user);
//     }
//   } catch (error) {
//     res.send("Something went wrong!..");
//   }
// });

// app.get("/feed", async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.send(users);
//   } catch (error) {
//     res.status(400).send("Something went wrong");
//   }
// });

// app.patch("/user/:userId", async (req, res) => {
//   const userid = req?.params?.userId;
//   const data = req.body;
//   try {
//     const ALLOWED_UPDATES = [
//       "firstName",
//       "lastName",
//       "age",
//       "photoUrl",
//       "about",
//       "skills",
//       "gender"
//     ];
//     const isUpdatesAllowed = Object.keys(data).every((k) =>
//       ALLOWED_UPDATES.includes(k)
//     );
//     if (!isUpdatesAllowed) {
//       throw new Error("Updating Not allowed for these fields!..");
//     }
//     if (data.password) {
//       data.password = await bcrypt.hash(data.password, 11);
//     }
//     //const user = await User.findByIdAndUpdate({ _id: userid }, data);
//     const user = await User.findByIdAndUpdate(userid, data, {
//       returnDocument: "after",
//       runValidators: true,
//     });
//     //console.log(user);
//     if (!user) {
//       return res.status(404).send("User not found");
//     }

//     res.send("User data updated successfully");
//   } catch (error) {
//     res.status(400).send("Updated Failed due to " + error.message);
//   }
// });

// app.delete("/user", async (req, res) => {
//   const userid = req.body.userId;
//   try {
//     const user = await User.findByIdAndDelete(userid);
//     res.send("User deleted successfully");
//   } catch (error) {
//     res.status(400).send("Something went wrong");
//   }
// });
