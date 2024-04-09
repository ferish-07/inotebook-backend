const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../modals/User");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchUsers");
const Token = require("../modals/Token");

const JWT_SECRET = "iNotebookJWtSecureText";
// to create a user
router.post(
  "/createUser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .send({ error: "Sorry a user with this email already exists" });
      }
      // Create a new user
      const salt = await bcrypt.genSalt(10);
      const securePassword = await bcrypt.hash(req.body.password, salt);
      console.log("-=-=-=-=-=-=-=-=-=-=-=", salt, securePassword);
      User.create({
        name: req.body.name,
        password: securePassword,
        email: req.body.email,
      })
        .then((user) => {
          const data = {
            user: {
              id: user.id,
            },
          };
          const authToken = jwt.sign(data, JWT_SECRET);
          console.log("---------Jwt-----------", authToken);
          res.send({
            error_status: false,
            message: "Data Inserted successfull",
          });
        })
        .catch((err) => {
          console.log(err);
          res.json({
            error: "Please enter a unique value for email",
            message: err.message,
          });
        });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Error occured");
    }
  }
);

//to authenticate the user "/api/auth/login"
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Please enter the password").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.send({
          error_status: true,
          message: "Please enter correct username/Password",
        });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.send({
          error_status: true,
          message: "Please enter correct username/Password",
        });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      let foundToken = await Token.findOne({ user: user.id });
      res.send({
        error_status: false,
        message: "Login successfull",
        token: authToken,
      });
      if (foundToken) {
        await Token.updateOne(
          { user: user.id },
          { $set: { token: authToken } }
        );
      } else {
        console.log(
          "------------------------------------------------------ user.name-",
          user.name
        );
        const newToken = new Token({
          token: authToken,
          user: user.id,
          user_name: user.name,
        });
        await newToken.save();
      }
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ error_status: true, message: "Internal server error " });
    }
  }
);

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/changepassword", fetchuser, async (req, res) => {
  const { email, old_password, password, confirm_password } = req.body;
  const user = await User.findOne({ email: email });
  const passwordCompare = await bcrypt.compare(old_password, user.password);

  if (!passwordCompare) {
    return res.send({
      error_status: true,
      message: "Please enter your correct password",
    });
  }

  if (password === confirm_password) {
    const salt = await bcrypt.genSalt(10);
    const securePassword = await bcrypt.hash(confirm_password, salt);

    await User.updateOne(
      { email: email },
      { $set: { password: securePassword } }
    ).then(() => {
      return res.send({
        error_status: false,
        message: "Password changed Successfully",
      });
    });
  } else {
    return res.send({
      error_status: true,
      message: "Passwords do not match. Please try again.",
    });
  }
});

module.exports = router;
