import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465 (implicit TLS)
  family: 4,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const buildOtpEmailHtml = ({ headerText, fullName, introText, otp }) => `
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f6; padding: 20px;">
  <tr>
    <td align="center">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <tr>
          <td style="background-color: #045D4B; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: normal; letter-spacing: 1px;">${headerText}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px;">
            <p style="color: #333333; font-size: 16px; margin-bottom: 20px; font-weight: bold;">Hi ${fullName},</p>
            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">${introText}</p>
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="display: inline-block; background-color: #f0f7f5; border: 2px dashed #045D4B; color: #045D4B; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px;">
                ${otp}
              </span>
            </div>
            <p style="color: #555555; font-size: 14px; text-align: center; margin-bottom: 30px;">
              <em>This code will expire in <strong>15 minutes</strong>.</em>
            </p>
            <hr style="border: none; border-top: 1px solid #eeeeee; margin-bottom: 20px;" />
            <p style="color: #888888; font-size: 12px; line-height: 1.5;">
              If you did not request this, your account is still secure and you can safely ignore this email. Never share this code with anyone.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f9f9f9; padding: 15px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="color: #aaaaaa; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} ToDo App. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

/**
 * Sends a 6-digit OTP email using a shared HTML template.
 * Used by both the authenticated "change password" flow and the
 * unauthenticated "forgot password" flow.
 */
export const sendOtpEmail = async ({ to, fullName, otp, subject, headerText, introText }) => {
  await transporter.verify();

  const info = await transporter.sendMail({
    from: '"ToDo App" <noreply@todo.com>',
    to,
    subject,
    text: `Hi ${fullName}, your OTP is ${otp}. It expires in 15 minutes. If you did not request this, you can ignore this email.`,
    html: buildOtpEmailHtml({ headerText, fullName, introText, otp }),
  });

  return info;
};