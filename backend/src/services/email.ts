import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, code: string, name: string) => {
  console.log(`[EMAIL] Attempting to send verification email to: ${email}`);
  console.log(`[EMAIL] Verification code: ${code}`);
  console.log(`[EMAIL] Recipient name: ${name}`);
  
  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev', 
      to: email,
      subject: 'Verify your JobPal account',
      html: `
        <h2>Welcome to JobPal, ${name}!</h2>
        <p>Please verify your email address by entering this code:</p>
        <h3 style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px;">${code}</h3>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
    });
    
    console.log(`[EMAIL] ✅ Successfully sent verification email to: ${email}`);
    console.log(`[EMAIL] Resend response:`, result);
    return true;
  } catch (error) {
    console.error(`[EMAIL] ❌ Failed to send verification email to: ${email}`);
    console.error(`[EMAIL] Error details:`, error);
    
    // Log specific error types for better debugging
    if (error instanceof Error) {
      console.error(`[EMAIL] Error message: ${error.message}`);
      console.error(`[EMAIL] Error stack: ${error.stack}`);
    }
    
    // Check for common Resend API errors
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as any;
      if (errorObj.message) {
        console.error(`[EMAIL] API Error: ${errorObj.message}`);
      }
      if (errorObj.name) {
        console.error(`[EMAIL] Error type: ${errorObj.name}`);
      }
    }
    
    return false;
  }
};