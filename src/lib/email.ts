/**
 * Email Dispatcher Utility (Simulated for development)
 * Prints email notifications to the server console.
 */
export const emailService = {
  /**
   * Sends an OTP verification email to a Super Author
   */
  async sendOTP(email: string, otp: string): Promise<void> {
    console.log('\n==================================================');
    console.log(`[EMAIL] To: ${email}`);
    console.log('[EMAIL] Subject: Password Change Verification Code');
    console.log(`[EMAIL] Content: Your OTP is: ${otp}. It will expire in 5 minutes.`);
    console.log('==================================================\n');
  },

  /**
   * Sends a password reset link to a Contributor
   */
  async sendResetLink(email: string, token: string): Promise<void> {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const resetUrl = `${origin}/admin?reset_token=${token}`;

    console.log('\n==================================================');
    console.log(`[EMAIL] To: ${email}`);
    console.log('[EMAIL] Subject: Password Reset Approved');
    console.log(`[EMAIL] Content: Your password change request has been approved. Use the secure link below:\n\n${resetUrl}\n\nThis link expires in 15 minutes.`);
    console.log('==================================================\n');
  },

  /**
   * Sends an approval notification to both Super Authors
   */
  async sendApprovalNotification(superAuthors: string[], requesterEmail: string, reason: string): Promise<void> {
    superAuthors.forEach((email) => {
      console.log('\n==================================================');
      console.log(`[EMAIL] To: ${email}`);
      console.log('[EMAIL] Subject: Password Change Approval Required');
      console.log(`[EMAIL] Content: A contributor (${requesterEmail}) has requested a password change. Reason: "${reason}". Review and approve the request from the admin dashboard.`);
      console.log('==================================================\n');
    });
  }
};
