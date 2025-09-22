const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendConnectionRequestEmail = async (toUser, fromUser, status) => {
  if (!toUser || !toUser.emailId) {
    console.log("Email not sent: no recipient email provided");
    return false;
  }

  const subject = "🔥 Someone Wants to Connect with You!";

  const htmlMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; border-radius: 15px; background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%); box-shadow: 0 8px 20px rgba(0,0,0,0.1); border: 1px solid #ddd;">
      
      <h2 style="color: #222; text-align: center;">Hi ${
        toUser.firstName
      } 👋</h2>
      
      <p style="font-size: 16px; color: #555; text-align:center;">
        <strong style="color:#ff5722;">${fromUser.firstName} ${
    fromUser.lastName
  }</strong> wants to connect with you! 💌
      </p>
      
      <div style="margin: 20px 0; text-align:center;">
        <img src="${
          fromUser.photoUrl || "https://via.placeholder.com/100"
        }" alt="User Photo" 
             style="width:120px; height:120px; border-radius:50%; border: 3px solid #ff5722; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
      </div>
      
      <p style="font-size: 15px; color: #555; text-align:center;">
        Don't miss out! Click below to view their profile and respond to the request:
      </p>
      
      <div style="text-align:center; margin: 30px 0;">
        <a href="http://yourapp.com/feed" 
           style="display:inline-block; padding: 14px 30px; background: #ff5722; color: #fff; font-weight: bold; font-size: 16px; text-decoration: none; border-radius: 50px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); transition: all 0.3s ease;">
           View Request
        </a>
      </div>
      
      <p style="font-size: 13px; color: #888; text-align:center;">
        Stay connected with <strong>Your App Name</strong> and grow your network!
      </p>

      <div style="margin-top: 20px; text-align:center; font-size:12px; color:#bbb;">
        © ${new Date().getFullYear()} DevTinder. All rights reserved.
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: toUser.emailId,
      subject: subject,
      html: htmlMessage,
    });

    console.log(`Connection request email sent to ${toUser.emailId}`);
    return true;
  } catch (err) {
    console.log("Error sending connection request email:", err);
    return false;
  }
};

const sendContactFormEmail = async (formData) => {
  const { firstName, lastName, email, phone, message, photoUrl } = formData;

  const mailOptions = {
    from: email, // Use your email as sender
    to: process.env.YOUR_EMAIL, // Your email to receive messages
    subject: `New Contact Form Submission from ${firstName} ${lastName}`,
    html: `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #f4f6f9; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
  <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; color: white; text-align: center;">
    <h2 style="margin:0; font-size: 24px;">New Contact Form Submission</h2>
  </div>
  <div style="padding: 20px;">
    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
      <img src="${
        photoUrl || "/default-avatar.png"
      }" alt="User Avatar" style="width:60px; height:60px; border-radius:50%; border:2px solid #764ba2; object-fit:cover;">
      <h3 style="margin:0; font-size:18px; color:#333;">${firstName} ${lastName}</h3>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 10px; font-weight: bold; background-color: #f0f0f0;">Email:</td>
        <td style="padding: 10px;">${email}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold; background-color: #f0f0f0;">Phone:</td>
        <td style="padding: 10px;">${phone || "Not provided"}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold; background-color: #f0f0f0;">Message:</td>
        <td style="padding: 10px;">${message}</td>
      </tr>
    </table>
    <p style="color: #666; font-size: 14px; text-align:center;">This message was sent from your website contact form.</p>
  </div>
</div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Contact form email sent successfully:", info.response);
    return true;
  } catch (err) {
    console.log("Error sending contact form email:", err);
    return false;
  }
};
module.exports = {
  sendConnectionRequestEmail,
  sendContactFormEmail,
};
