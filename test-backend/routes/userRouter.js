import express from "express";
import User from "../models/UserSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";
const router = express.Router();
///Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // validation
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Please fill all the fields!" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters!" });
    }
    //checking strength of password
    var passwordFormat = new RegExp("^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])");
    const checkPasswordFormat = password.match(passwordFormat);
    if (!checkPasswordFormat) {
      return res.status(400).json({
        msg:
          "Password must contain at least one uppercase, numeric and special character!",
      });
    }
    //checking for valid email
    const mailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const checkMailFormat = email.match(mailFormat);
    if (!checkMailFormat) {
      return res
        .status(400)
        .json({ msg: "Please enter the valid email address!" });
    }
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "An account with this email already exist.!" });
    }
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      email,
      password: passwordHash,
    });
    const saveUser = await newUser.save();
    res.json(saveUser);
  } catch (err) {
    res.status(500).json({ err: "Error" });
  }
});

//LOgin
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Please fill all the fields!" });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ msg: "This email is not Registered!!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Password do not matched!!" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_WEBTOKEN_PASSWORD);
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (err) {
    res.status(500).json({ err: "Error" });
  }
});

// Delete account
router.delete("/delete", auth, async (req, res) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.user);
    res.json(deleteUser);
  } catch (err) {
    res.status(500).json({ err: "Error" });
  }
});
router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_WEBTOKEN_PASSWORD);
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);
    return res.json(true);
  } catch (err) {
    res.status(500).json({ err: "Error" });
  }
});

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({
    id: user._id,
    username: user.username,
  });
});
export default router;
