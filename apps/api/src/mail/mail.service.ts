import { Injectable, Logger } from '@nestjs/common';

export interface OrderEmailDetails {
  to: string;
  customerName: string;
  productTitle: string;
  price: number | string;
  deliveryAddress: string;
  deliveryDays: string;
}

export interface OrderCancelledEmailDetails {
  to: string;
  customerName: string;
  orderId: string;
  productTitle: string;
  totalAmount: number | string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly brevoApiKey = process.env.BREVO_API_KEY || '';
  private readonly senderEmail = process.env.MAIL_USER || 'reddychandanreddy143@gmail.com';

  private async sendEmailViaApi(to: string, subject: string, htmlContent: string): Promise<boolean> {
    if (!this.brevoApiKey) {
      this.logger.error('BREVO_API_KEY environment variable is not defined.');
      return false;
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'Reddy Store', email: this.senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(`Brevo API error: ${JSON.stringify(errorData)}`);
        return false;
      }

      this.logger.log(`Email successfully delivered to ${to} via Brevo HTTPS API`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      return false;
    }
  }

  async sendOtpEmail(to: string, otp: string): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">Reddy Store Verification</h2>
        <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">Use the verification code below to complete your registration:</p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: bold; background-color: #f1f5f9; padding: 14px 28px; border-radius: 8px; color: #1e293b; border: 1px dashed #cbd5e1;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-top: 24px;">This code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
      </div>
    `;
    return this.sendEmailViaApi(to, 'Your Verification Code - Reddy Store', htmlContent);
  }

  async sendPasswordResetOtpEmail(to: string, otp: string): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">Password Reset Request</h2>
        <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">Use the verification code below to reset your password:</p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: bold; background-color: #f1f5f9; padding: 14px 28px; border-radius: 8px; color: #1e293b; border: 1px dashed #cbd5e1;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-top: 24px;">This code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
      </div>
    `;
    return this.sendEmailViaApi(to, 'Password Reset OTP - Reddy Store', htmlContent);
  }

  async sendOrderConfirmationEmail(details: OrderEmailDetails): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #16a34a; margin-bottom: 8px;">Order Confirmation</h2>
        <p style="color: #475569; font-size: 14px;">Hi ${details.customerName},</p>
        <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">Your order has been placed successfully!</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Product:</strong> ${details.productTitle}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Total Price:</strong> ₹${details.price}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Delivery Address:</strong> ${details.deliveryAddress}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Estimated Delivery:</strong> ${details.deliveryDays}</p>
        </div>
        <p style="color: #64748b; font-size: 12px;">Thank you for shopping with Reddy Store!</p>
      </div>
    `;
    return this.sendEmailViaApi(details.to, `Order Confirmed: ${details.productTitle}`, htmlContent);
  }

  async sendOrderCancelledEmail(details: OrderCancelledEmailDetails): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #dc2626; margin-bottom: 8px;">Order Cancelled</h2>
        <p style="color: #475569; font-size: 14px;">Hi ${details.customerName},</p>
        <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">Your order <strong>#${details.orderId}</strong> for <strong>${details.productTitle}</strong> (₹${details.totalAmount}) has been cancelled.</p>
        <p style="color: #64748b; font-size: 12px;">If you have any questions, please contact our support team.</p>
      </div>
    `;
    return this.sendEmailViaApi(details.to, `Order Cancelled: ${details.orderId}`, htmlContent);
  }

  async sendOrderCancellationEmail(details: OrderCancelledEmailDetails): Promise<boolean> {
    return this.sendOrderCancelledEmail(details);
  }
}