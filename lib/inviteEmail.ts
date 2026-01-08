/**
 * Helper function to send invite emails to new users
 * This function handles the email sending logic for user invitations
 */
export interface InviteEmailData {
  email: string;
  firstName: string;
  token: string;
}

/**
 * Sends an invitation email to a user with a secure link to set their password
 * 
 * @param data - Object containing email, first name, and invite token
 * @returns Promise that resolves when email is sent (or fails)
 */
export async function sendInviteEmail(data: InviteEmailData): Promise<void> {
  const { email, firstName, token } = data;
  
  // Build the invite link using the frontend URL from environment
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.destinycreditai.com';
  const inviteLink = `${frontendUrl}/set-password?token=${token}`;
  
  // In a production environment, you would use an email service like:
  // - Resend
  // - SendGrid  
  // - AWS SES
  // - Mailgun
  // For now, we'll just log what would be sent
  
  console.log(`📧 Sending invite email to: ${email}`);
  console.log(`Subject: Welcome to DestinyCreditAI - Set Your Password`);
  console.log(`Body: Hello ${firstName},

Welcome to DestinyCreditAI! Click the link below to set your password and activate your account:

${inviteLink}

This link will expire in 24 hours.

Best regards,
The DestinyCreditAI Team`);
  
  // For production, implement with your email service (Resend, SendGrid, etc.)
  // For now, we'll simulate email sending
  console.log(`Invite email would be sent to: ${email}`);
  
  // Simulate a potential delay for email processing
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return Promise.resolve();
}