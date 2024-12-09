const {userModel} = require("../models/userModel.js");
const { sendAcknowledgementEmailToUser } = require("../utils/emailUtils.js");
exports.approveUser = async (req, res) => {
  const { userId } = req.params;
  console.log(userId)
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Approve the user
    user.isApproved = true;
    await user.save();
    await sendAcknowledgementEmailToUser(user);
    res.send(`<h1>User ${user.username} has been approved successfully</h1>`);
  } catch (err) {
    console.error("Error approving user:", err);
    res.status(500).send("Error approving user");
  }
};
