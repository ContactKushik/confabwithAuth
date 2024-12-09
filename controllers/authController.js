const {userModel,validate} = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken.js");
const {sendApprovalEmailToAdmins} = require("../utils/emailUtils.js");

exports.registerUser = async (req, res) => {
  try {
    console.log("registerroute acces hua");
    const { username, email, password } = req.body;

    // Validate user data
    const { error } = validate({ username, email, password });
    if (error) {
      console.log(error);
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Check if the user already exists
    let user = await userModel.findOne({ email: email });
    if (user) {
      console.log("user already exists");
      return res.status(400).json({ success: false, message: "User already registered" });
    }

    // Generate salt and hash the password
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(password, salt);

    // Create new user
    user = await userModel.create({
      email,
      password: hash,
      username,
    });

    await sendApprovalEmailToAdmins(user);
    // Generate token
    // const token = generateToken({ email });

    // // Set token in cookie
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: true,
    //   maxAge: 30 * 24 * 60 * 60 * 1000,
    // });
    
        res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ success: false, message: "Error registering user" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email" });
    }

    let result = await bcrypt.compare(password, user.password);

    if (result) {
      if (!user.isApproved) {
        return res.status(403).json({ success: false, message: "Account not approved by admin" });
      }
      const token = generateToken({ email });
      console.log(token);
      // Set token in cookie
      // res.cookie("token", token, {
      //   httpOnly: true,
      //   secure: true,
      //   maxAge: 30 * 24 * 60 * 60 * 1000,
      // });
      console.log("user logged in successfully");
      return res.status(200).json({ success: true, message: "User logged in successfully", jwtToken:token,name:user.username });
    } else {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (e) {
    console.error("Error logging in user:", e);
    res.status(500).json({ success: false, message: "Error logging in user" });
  }
};

exports.logoutUser = (req, res) => {
  res.clearCookie("token");
  // res.redirect("/");
};

exports.getChat = (req, res) => {
   res.render('chat', { user: req.user });
};
