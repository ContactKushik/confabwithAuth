const express = require("express");
const { approveUser } = require("../controllers/adminController.js");

const router = express.Router();

router.get("/approve/:userId", approveUser);
router.get("/",(req,res)=>{
    res.send("Admin dashboard");
})

module.exports = router;
