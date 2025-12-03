const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Grievance Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

const sendUserSignupNotification = async (user) => {
  const subject = 'New User Registration - Approval Required';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
        <h2 style="color: #0066cc; text-align: center;">New User Registration</h2>
        <p>A new user has registered and requires your approval:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Phone:</strong> ${user.phone}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          ${user.rollNumber ? `<p><strong>Roll Number:</strong> ${user.rollNumber}</p>` : ''}
          ${user.department ? `<p><strong>Department:</strong> ${user.department}</p>` : ''}
          ${user.course ? `<p><strong>Course:</strong> ${user.course}</p>` : ''}
        </div>
        
        <p style="margin-top: 20px;">Please log in to the admin dashboard to approve or reject this user.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:5000" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Admin Dashboard
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
          This is an automated message from the Grievance Management System.
        </p>
      </div>
    </div>
  `;

  return await sendEmail(process.env.ADMIN_EMAIL, subject, html);
};

const sendApprovalNotification = async (user) => {
  const subject = 'Your Account Has Been Approved';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
        <h2 style="color: #28a745; text-align: center;">Account Approved! 🎉</h2>
        
        <p>Dear ${user.name},</p>
        
        <p>Great news! Your account has been approved by the administrator.</p>
        
        <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p style="margin: 0; color: #155724;">
            <strong>You can now log in to the Grievance Management System</strong>
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Your Account Details:</strong></p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role}</p>
        </div>
        
        <p>You can now:</p>
        <ul>
          <li>Submit grievances</li>
          <li>Track your grievance status</li>
          <li>View notifications</li>
          <li>Access your personalized dashboard</li>
        </ul>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:5000" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login Now
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
          This is an automated message from the Grievance Management System.
        </p>
      </div>
    </div>
  `;

  return await sendEmail(user.email, subject, html);
};

const sendRejectionNotification = async (user) => {
  const subject = 'Account Registration Update';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
        <h2 style="color: #dc3545; text-align: center;">Registration Not Approved</h2>
        
        <p>Dear ${user.name},</p>
        
        <p>We regret to inform you that your account registration has not been approved at this time.</p>
        
        <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <p style="margin: 0; color: #721c24;">
            Your registration for the email <strong>${user.email}</strong> has been declined.
          </p>
        </div>
        
        <p>If you believe this is an error or need further assistance, please contact the administrator.</p>
        
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
          This is an automated message from the Grievance Management System.
        </p>
      </div>
    </div>
  `;

  return await sendEmail(user.email, subject, html);
};

module.exports = {
  sendEmail,
  sendUserSignupNotification,
  sendApprovalNotification,
  sendRejectionNotification
};
