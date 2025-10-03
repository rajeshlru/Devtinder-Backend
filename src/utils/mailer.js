const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  // Add connection options
  socketTimeout: 60000, // 60 seconds
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000, // 30 seconds
  secure: false, // Use TLS
  tls: {
    rejectUnauthorized: false,
  },
});

// Enhanced verification with retry
const verifyTransporter = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await transporter.verify();
      console.log("✓ Email server is ready to send messages");
      return true;
    } catch (error) {
      console.log(
        `✗ Email verification attempt ${i + 1} failed:`,
        error.message
      );
      if (i === retries - 1) {
        console.log("✗ All email verification attempts failed");
        return false;
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

verifyTransporter();

const sendConnectionRequestEmail = async (toUser, fromUser) => {
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

const sendWelcomeEmail = async (firstName, lastName, emailId, retries = 3) => {
  const mailOptions = {
    from: process.env.YOUR_EMAIL,
    to: emailId,
    subject: `${firstName} Welcome to DevTinder`,
    html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 4px; border-radius: 20px;">
  <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1);">
    
    <!-- Premium Header -->
    <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 40px 30px; text-align: center; position: relative;">
      <!-- Animated Background Elements -->
      <div style="position: absolute; top: 20px; right: 20px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
      <div style="position: absolute; bottom: 20px; left: 20px; width: 40px; height: 40px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
      
      <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.3);">
        <span style="font-size: 36px;">💻</span>
      </div>
      <h1 style="margin:0; font-size: 28px; color:#fff; font-weight: 700; letter-spacing: -0.3px;">Welcome to DevTinder</h1>
      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 400;">Where Developers Connect & Create</p>
    </div>

    <!-- Welcome Section -->
    <div style="padding: 35px 30px; text-align: center; background: linear-gradient(to bottom, #ffffff, #fafbff);">
      <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.25); border: 3px solid white;">
        <span style="font-size: 28px;">👋</span>
      </div>
      <h2 style="margin:0 0 15px; color:#1f2937; font-size: 26px; font-weight: 600;">Hello ${firstName}!</h2>
      <p style="font-size: 16px; color:#6b7280; line-height: 1.6; margin: 0;">
        We're <strong style="color:#4f46e5;">thrilled</strong> to welcome you to our community of passionate developers ready to build amazing things together.
      </p>
    </div>

    

    <!-- Quick Start Section -->
    <div style="padding: 35px 30px;">
      <h3 style="margin:0 0 25px; color:#1f2937; font-size: 22px; text-align: center; font-weight: 600;">Get Started in 3 Steps</h3>
      
      <!-- Feature Cards -->
      <div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin-bottom: 30px;">
        <!-- Card 1 -->
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="width: 45px; height: 45px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 18px;">📝</span>
            </div>
            <div>
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-size: 16px;">Build Your Profile</div>
              <div style="font-size: 14px; color: #6b7280;">Showcase your skills and let others discover your talent</div>
            </div>
          </div>
        </div>
        
        <!-- Card 2 -->
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="width: 45px; height: 45px; background: linear-gradient(135deg, #7c3aed, #a855f7); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 18px;">🔍</span>
            </div>
            <div>
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-size: 16px;">Find Your Match</div>
              <div style="font-size: 14px; color: #6b7280;">Connect with developers who share your interests</div>
            </div>
          </div>
        </div>
        
        <!-- Card 3 -->
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="width: 45px; height: 45px; background: linear-gradient(135deg, #f97316, #fb923c); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 18px;">🚀</span>
            </div>
            <div>
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-size: 16px;">Start Collaborating</div>
              <div style="font-size: 14px; color: #6b7280;">Build amazing projects and grow together</div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <a href="http://yourapp.com/profile" 
           style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; font-weight: 600; text-decoration: none; border-radius: 50px; box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3); font-size: 15px; border: none;">
           <span>🎯</span> Setup Profile
        </a>
        <a href="http://yourapp.com/explore" 
           style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: white; color: #4f46e5; font-weight: 600; text-decoration: none; border-radius: 50px; border: 2px solid #e5e7eb; font-size: 15px;">
           <span>🌐</span> Explore
        </a>
      </div>
    </div>

    <!-- Success Story -->
    <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 30px; text-align: center;">
      <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #0ea5e9, #0284c7); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
        <span style="color: white; font-size: 20px;">⭐</span>
      </div>
     
      <p style="font-size: 13px; color:#64748b; margin: 10px 0 0; font-weight: 600;">- Rajesh, Full Stack Developer</p>
    </div>

    <!-- Final Call to Action -->
    <div style="padding: 35px 30px; text-align: center;">
      <h3 style="margin:0 0 15px; color:#1f2937; font-size: 22px; font-weight: 600;">Ready to Begin?</h3>
      <p style="font-size: 15px; color:#6b7280; line-height: 1.6; margin: 0 0 20px;">
        Your journey to amazing collaborations starts now. Let's build something incredible together!
      </p>
      <a href="http://yourapp.com/dashboard" 
         style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: 600; text-decoration: none; border-radius: 50px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3); font-size: 15px;">
         <span>✨</span> Get Started Now
      </a>
    </div>

    <!-- Footer -->
    <div style="background: #1f2937; padding: 30px; text-align: center; color: #9ca3af;">
      <div style="margin-bottom: 20px;">
        <a href="#" style="margin: 0 10px; display: inline-block;">
          <span style="color: #d1d5db; font-size: 20px;">📱</span>
        </a>
        <a href="#" style="margin: 0 10px; display: inline-block;">
          <span style="color: #d1d5db; font-size: 20px;">💬</span>
        </a>
        <a href="#" style="margin: 0 10px; display: inline-block;">
          <span style="color: #d1d5db; font-size: 20px;">🐙</span>
        </a>
      </div>
      <p style="margin: 8px 0; font-size: 14px; font-weight: 500;">© ${new Date().getFullYear()} DevTinder</p>
      <p style="margin: 8px 0; font-size: 12px; color: #6b7280;">
        Connecting developers
      </p>
      <div style="margin-top: 20px;">
        <a href="http://yourapp.com/unsubscribe" style="color: #9ca3af; font-size: 12px; text-decoration: none; margin: 0 8px;">Unsubscribe</a>
        <a href="http://yourapp.com/privacy" style="color: #9ca3af; font-size: 12px; text-decoration: none; margin: 0 8px;">Privacy</a>
        <a href="http://yourapp.com/help" style="color: #9ca3af; font-size: 12px; text-decoration: none; margin: 0 8px;">Help</a>
      </div>
    </div>
  </div>
</div>`,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✓ Welcome email sent to ${emailId}`);
      return true;
    } catch (err) {
      console.log(
        `✗ Attempt ${attempt} failed to send email to ${emailId}:`,
        err.message
      );

      if (attempt === retries) {
        console.log("✗ All attempts to send email failed");
        return false;
      }

      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = {
  sendConnectionRequestEmail,
  sendContactFormEmail,
  sendWelcomeEmail,
};
