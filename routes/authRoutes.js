const express = require("express");
const {
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  getChat,
  getVerify,
} = require("../controllers/authController.js");
const passport = require("passport");

const router = express.Router();
router.get('/', (req, res) => {
  // Check if the user is already logged in by verifying the token
  if (req.cookies.token) {
    return res.redirect('/chat'); // Redirect to chat if the user is logged in
  }
  res.render('login'); // Render login page if not logged in
});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

// Protect profile route with Passport JWT
router.get(
  "/verify",
  passport.authenticate("jwt", { session: false }),
  getVerify
);

module.exports = router;
