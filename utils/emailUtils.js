const nodemailer = require("nodemailer");

const sendApprovalEmailToAdmins = async (user) => {
  const adminEmails = process.env.ADMIN_EMAILS.split(","); // Comma-separated list of admin emails
  const approveLink = `${process.env.APP_URL}/admin/approve/${user._id}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail", // Replace with your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmails, // Send to all admins
    subject: "User Approval Request",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
        <h1 style="color: #333;">New User Registration</h1>
        <h2 style="font-size: 18px; color: #555;">Name: ${user.username}</h2>
        <h2 style="font-size: 18px; color: #555;">Email: ${user.email}</h2>
        <h2>
          <a href="${approveLink}" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Approve this user</a>
        </h2>
      </div>
    `,
  };

  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email, // Send to the user
    subject: "Account Pending Approval",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
        <h1 style="color: #333;">Account Pending Approval</h1>
        <p style="font-size: 16px; color: #555;">Dear ${user.username},</p>
        <p style="font-size: 16px; color: #555;">Your account is currently pending approval. You will be notified once it has been approved. Thank you for your patience!</p>
      </div>
    `,
  };

  await transporter.sendMail(adminMailOptions);
  await transporter.sendMail(userMailOptions);
};

const sendAcknowledgementEmailToUser = async (user) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Replace with your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const acknowledgementMailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email, // Send to the user
    subject: "Acknowledgement of Registration",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
        <h1 style="color: #333;">Registration Acknowledgement</h1>
        <p style="font-size: 16px; color: #555;">Dear ${user.username}, you have been approved.</p>
      </div>
    `,
  };

  await transporter.sendMail(acknowledgementMailOptions);
};

module.exports = { sendApprovalEmailToAdmins, sendAcknowledgementEmailToUser };
