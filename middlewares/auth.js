const adminAuth = (req, res, next) => {
  console.log("Admin authentication executed");
  const token = "xyz";
  const isAdminAuthorized = token === "xyz";
  if (isAdminAuthorized) {
    res.status(403).send("Access denied. Admins only.");
  } else {
    next();
  }
};

const userAuth = (req, res, next) => {
  console.log("User authentication executed");
  const token = "xyz";
  const isUserAuthorized = token === "xyz";
  if (isUserAuthorized) {
    res.status(403).send("Access denied. Admins only.");
  } else {
    next();
  }
};

module.exports = { adminAuth, userAuth };
