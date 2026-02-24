const nodemailer = require('nodemailer');

/**
 * Creates a nodemailer transporter.
 * If SMTP_HOST is not set, logs emails to console (dev mode).
 */
const createTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
};

const FROM = process.env.SMTP_FROM || 'noreply@useful-tools.app';
const APP_NAME = 'Useful Tools SaaS';

/**
 * Send an email. Falls back to console.log if no SMTP configured.
 */
const sendMail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n📧 [DEV EMAIL - no SMTP configured]');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${text || '(see html)'}`);
    console.log('─'.repeat(60));
    return { messageId: 'dev-mode', simulated: true };
  }

  return transporter.sendMail({
    from: `"${APP_NAME}" <${FROM}>`,
    to,
    subject,
    html,
    text
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const subject = `Reset your ${APP_NAME} password`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e293b;">Password Reset Request</h2>
      <p style="color: #64748b;">You requested a password reset for your ${APP_NAME} account.</p>
      <p style="color: #64748b;">Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
      <a href="${resetUrl}" style="display:inline-block; background:#4f46e5; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; margin:16px 0;">
        Reset Password
      </a>
      <p style="color: #94a3b8; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      <p style="color: #94a3b8; font-size: 13px;">Or copy this URL: ${resetUrl}</p>
    </div>
  `;
  const text = `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`;
  return sendMail({ to, subject, html, text });
};

/**
 * Send welcome email after registration
 */
const sendWelcomeEmail = async ({ to, name }) => {
  const subject = `Welcome to ${APP_NAME}!`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e293b;">Welcome${name ? ', ' + name : ''}! 🎉</h2>
      <p style="color: #64748b;">Your account has been created successfully.</p>
      <p style="color: #64748b;">You now have access to <strong>21 professional tools</strong> on the Free plan.</p>
      <a href="${process.env.FRONTEND_URL}/tools" style="display:inline-block; background:#4f46e5; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; margin:16px 0;">
        Explore Tools
      </a>
    </div>
  `;
  const text = `Welcome to ${APP_NAME}! Start using your tools at ${process.env.FRONTEND_URL}/tools`;
  return sendMail({ to, subject, html, text });
};

module.exports = { sendMail, sendPasswordResetEmail, sendWelcomeEmail };

