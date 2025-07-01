import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/api/auth/verify-email?token=${token}`;
  
  try {
    const data = await resend.emails.send({
      from: `${process.env.NEXT_PUBLIC_PROJECT_NAME} <${process.env.EMAIL_FROM || 'noreply@audiotexthub.pro'}>`,
      to: email,
      subject: '验证您的邮箱 - Verify Your Email',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">欢迎加入 ${process.env.NEXT_PUBLIC_PROJECT_NAME}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            感谢您的注册！请点击下面的按钮验证您的邮箱地址：
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Thank you for signing up! Please click the button below to verify your email address:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" 
               style="background-color: #3b82f6; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;
                      font-weight: bold;">
              验证邮箱 / Verify Email
            </a>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center;">
            如果按钮无法点击，请复制以下链接到浏览器：<br>
            If the button doesn't work, copy this link to your browser:<br>
            <a href="${verifyUrl}" style="color: #3b82f6; word-break: break-all;">
              ${verifyUrl}
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            此链接24小时内有效 / This link expires in 24 hours
          </p>
        </div>
      `
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/auth/reset-password?token=${token}`;
  
  try {
    const data = await resend.emails.send({
      from: `${process.env.NEXT_PUBLIC_PROJECT_NAME} <${process.env.EMAIL_FROM || 'noreply@audiotexthub.pro'}>`,
      to: email,
      subject: '重置密码 - Reset Password',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">重置您的密码</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            我们收到了您的密码重置请求。点击下面的按钮来设置新密码：
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            We received your password reset request. Click the button below to set a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #ef4444; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;
                      font-weight: bold;">
              重置密码 / Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center;">
            如果您没有请求重置密码，请忽略此邮件。<br>
            If you didn't request a password reset, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            此链接1小时内有效 / This link expires in 1 hour
          </p>
        </div>
      `
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error };
  }
}