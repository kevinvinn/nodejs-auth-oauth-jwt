const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { totp } = require("otplib"); // Import otplib
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;
const MailerController = require("../mailer.controller");

totp.options = { step: 60 }; // OTP berlaku selama 60 detik

class RegisterController {
  static async register(req, res) {
    const { user_name, user_email, user_password, user_phone } = req.body;
    const hashedPassword = await bcrypt.hash(user_password, 10);

    try {
      // Memulai transaksi
      const result = await prisma.$transaction(async (prisma) => {
        // Membuat user baru
        const newUser = await prisma.users.create({
          data: {
            user_name,
            user_email,
            user_password: hashedPassword,
            user_phone,
            user_is_active: "unverified", // Status default "unverified"
          },
        });

        // Membuat OTP
        const secret = user_email; // Menggunakan email sebagai secret
        const otpCode = totp.generate(secret); // Menghasilkan kode OTP
        const hashedOtp = await bcrypt.hash(otpCode, 10);

        // Menambahkan OTP ke database dengan data tambahan
        const now = new Date();
        const otpRecord = await prisma.otp.create({
          data: {
            user_id: newUser.user_id,
            otp_code: hashedOtp,
            otp_expires_at: new Date(Date.now() + 60 * 1000), // Berlaku 1 menit
            otp_request_count: 1, // Set permintaan OTP pertama kali
            otp_request_reset_at: new Date(Date.now() + 1 * 60000), // Reset 1 menit ke depan
            last_otp_requested_at: now, // Waktu permintaan OTP pertama kali
          },
        });

        // Kirim email OTP
        await MailerController.sendOtpEmail(user_email, otpCode);

        return { otpRecord, newUser };
      });

      // Merespons registrasi berhasil
      res.status(201).json({
        message: "Registrasi berhasil. Kode OTP telah dikirim ke email Anda.",
        otp_request_reset_at: result.otpRecord.otp_request_reset_at,
        last_otp_requested_at: result.otpRecord.last_otp_requested_at,
      });
    } catch (error) {
      console.error("Error pada registrasi:", error);
      res.status(500).json({
        error: "Gagal mendaftarkan user.",
        detail: error.message,
      });
    }
  }
}
module.exports = RegisterController;
