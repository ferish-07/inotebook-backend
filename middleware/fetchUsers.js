var jwt = require("jsonwebtoken");
const Token = require("../modals/Token");
const User = require("../modals/User");
const JWT_SECRET = "iNotebookJWtSecureText";

const getTokens = async (token, req) => {
  let users = await User.findOne({ email: req.body.email });
  let userTokenFromDatabase = await Token.findOne({ user: users.id });
  console.log(
    "-=-=-=-token check from Database=-=-=-=-",
    token == userTokenFromDatabase.token
  );
};

const fetchuser = (req, res, next) => {
  // Get the user from the jwt token and add id to req object
  const token = req.header("token");

  if (!token) {
    res.status(401).send({
      error_status: true,
      message: "Please authenticate using a valid token",
    });
  }
  try {
    // getTokens(token, req); //to check token from backend token DataBase

    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({
      error_status: true,
      message: "Please authenticate using a valid token",
    });
  }
};

module.exports = fetchuser;
