import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

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
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(<any>{
      host: 'smtp.gmail.com',
      port: 465,
      family: 4,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendOtpEmail(to: string, otp: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to,
        subject: 'Your Verification Code - Reddy Store',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #4f46e5; margin-bottom: 8px;">Reddy Store Verification</h2>
            <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">Use the verification code below to complete your registration:</p>
            <div style="text-align: center; margin: 28px 0;">
              <span style="display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: bold; background-color: #f1f5f9; padding: 14px 28px; border-radius: 8px; color: #1e293b; border: 1px dashed #cbd5e1;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 24px;">This code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
          </div>
        `,
      });
      this.logger.log(`OTP successfully sent to ${to}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send OTP to ${to}: ${error?.message || error}`);
      return false;
    }
  }

  async sendPasswordResetOtpEmail(to: string, otp: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to,
        subject: 'Reset Your Password - Reddy Store',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #dc2626; margin-bottom: 8px;">Password Reset Request</h2>
            <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">Use the security code below to set a new password:</p>
            <div style="text-align: center; margin: 28px 0;">
              <span style="display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: bold; background-color: #fef2f2; padding: 14px 28px; border-radius: 8px; color: #991b1b; border: 1px dashed #fca5a5;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 24px;">This code is valid for 10 minutes.</p>
          </div>
        `,
      });
      this.logger.log(`Password reset OTP sent to ${to}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send reset OTP to ${to}: ${error?.message || error}`);
      return false;
    }
  }

  async sendOrderConfirmationEmail(details: OrderEmailDetails): Promise<boolean> {
    try {
      const formattedPrice = Number(details.price).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      });

      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to: details.to,
        subject: `Order Confirmed: ${details.productTitle} - Reddy Store`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
              <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Reddy Store</h1>
              <p style="color: #16a34a; font-weight: bold; margin: 6px 0 0 0; font-size: 16px;">✓ Order Placed Successfully!</p>
            </div>

            <p style="color: #334155; font-size: 14px; margin-top: 18px;">
              Hi <strong>${details.customerName}</strong>,<br>
              Thank you for shopping with us! Your booking is confirmed and is being prepared for dispatch.
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="color: #64748b; padding-bottom: 8px;">Product:</td>
                  <td style="color: #0f172a; font-weight: bold; text-align: right; padding-bottom: 8px;">${details.productTitle}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding-bottom: 8px;">Total Payable:</td>
                  <td style="color: #0f172a; font-weight: bold; text-align: right; padding-bottom: 8px;">${formattedPrice}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding-bottom: 8px;">Payment Mode:</td>
                  <td style="color: #ea580c; font-weight: bold; text-align: right; padding-bottom: 8px;">Cash on Delivery (COD)</td>
                </tr>
                <tr>
                  <td style="color: #64748b;">Expected Delivery:</td>
                  <td style="color: #2563eb; font-weight: bold; text-align: right;">${details.deliveryDays}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
              <span style="color: #b45309; font-size: 12px; font-weight: bold;">Delivery Location:</span>
              <p style="color: #78350f; font-size: 13px; margin: 4px 0 0 0;">${details.deliveryAddress}</p>
            </div>

            <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 8px; padding: 12px; text-align: center;">
              <p style="color: #065f46; font-size: 12px; margin: 0; font-weight: 600;">
                💵 Keep ${formattedPrice} ready in cash when your delivery partner arrives.
              </p>
            </div>

            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 24px;">
              Need help? Reply directly to this email or visit Reddy Store Support.
            </p>
          </div>
        `,
      });
      this.logger.log(`Order confirmation email sent to ${details.to}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send order email to ${details.to}: ${err?.message || err}`);
      return false;
    }
  }

  async sendOrderCancelledEmail(details: OrderCancelledEmailDetails): Promise<boolean> {
    try {
      const formattedPrice = Number(details.totalAmount).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      });

      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to: details.to,
        subject: `Order #${details.orderId.slice(0, 8).toUpperCase()} Cancelled - Reddy Store`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
              <h1 style="color: #dc2626; margin: 0; font-size: 24px;">Reddy Store</h1>
              <p style="color: #dc2626; font-weight: bold; margin: 6px 0 0 0; font-size: 16px;">Order Cancelled</p>
            </div>

            <p style="color: #334155; font-size: 14px; margin-top: 18px;">
              Hi <strong>${details.customerName}</strong>,<br>
              Your order <strong>#${details.orderId.slice(0, 8).toUpperCase()}</strong> has been successfully cancelled as per your request.
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="color: #64748b; padding-bottom: 8px;">Cancelled Items:</td>
                  <td style="color: #0f172a; font-weight: bold; text-align: right; padding-bottom: 8px;">${details.productTitle}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding-bottom: 8px;">Order Value:</td>
                  <td style="color: #0f172a; font-weight: bold; text-align: right; padding-bottom: 8px;">${formattedPrice}</td>
                </tr>
                <tr>
                  <td style="color: #64748b;">Payment Status:</td>
                  <td style="color: #16a34a; font-weight: bold; text-align: right;">Voided (No Cash Collection)</td>
                </tr>
              </table>
            </div>

            <p style="color: #64748b; font-size: 13px;">
              If this cancellation was accidental, you can browse our catalog and place a new order anytime.
            </p>

            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 24px;">
              &copy; 2026 Reddy Store. All rights reserved.
            </p>
          </div>
        `,
      });
      this.logger.log(`Order cancellation email sent to ${details.to}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send cancellation email to ${details.to}: ${err?.message || err}`);
      return false;
    }
  }
}





