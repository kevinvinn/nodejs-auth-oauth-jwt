const nodemailer = require("nodemailer");
const Mailer = require("../../libs/nodemailer");

class MailerController {
  static async sendForgotPasswordEmail(email, resetLink) {
    const mailOptions = {
      from: "SkyTicket - Tim7 <no-reply@skyticket.binar>",
      to: email,
      subject: "Reset Password",
      html: `<p>Click link di bawah ini untuk reset password anda:</p>
      <a href="${resetLink}">${resetLink}</a>`,
    };

    Mailer.sendEmail(mailOptions);
  }

  static async sendOtpEmail(email, otpCode) {
    const mailOptions = {
      from: "SkyTicket - Tim7 <no-reply@skyticket.binar>",
      to: email,
      subject: "Verifikasi OTP untuk Registrasi",
      html: `<p>Untuk menyelesaikan pendaftaran Anda, masukkan kode OTP berikut:</p>
              <h3>${otpCode}</h3>
              <p>Kode ini akan kedaluwarsa dalam 1 menit.</p>`,
    };

    Mailer.sendEmail(mailOptions);
  }

  static async resendOtpEmail(email, otpCode) {
    const mailOptions = {
      from: "SkyTicket - Tim7 <no-reply@skyticket.binar>",
      to: email,
      subject: "Resend OTP untuk Registrasi",
      html: `<p>Permintaan untuk mengirim ulang OTP diterima. Masukkan kode OTP berikut:</p>
              <h3>${otpCode}</h3>
              <p>Kode ini akan kedaluwarsa dalam 1 menit.</p>`,
    };

    Mailer.sendEmail(mailOptions);
  }
}

module.exports = MailerController;
