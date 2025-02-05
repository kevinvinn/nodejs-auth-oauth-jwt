const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { totp } = require("otplib"); // Import otplib
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;
console.log("JWT Secret:", SECRET_KEY);
const MailerController = require("./mailer.controller");

// Konfigurasi `otplib` (opsional, jika Anda ingin mengubah durasi OTP)
totp.options = { step: 60 }; // OTP berlaku selama 60 detik

class AuthController {
  async login(req, res) {
    const { email, user_password } = req.body;

    try {
      const user = await prisma.users.findUnique({
        where: { user_email: email },
      });

      if (!user) {
        return res.status(401).json({ message: "Email atau Password salah." });
      }

      if (user.user_is_active === "unverified") {
        return res.status(400).json({
          message:
            "Akun belum diverifikasi. Harap verifikasi melalui OTP terlebih dahulu.",
        });
      }

      const isPasswordValid = await bcrypt.compare(
        user_password,
        user.user_password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Email atau Password salah." });
      }

      const token = jwt.sign(
        {
          userID: user.user_id,
          email: user.user_email,
          role: user.user_role,
        },
        SECRET_KEY,
        { expiresIn: "5h" }
      );
      console.log("Generated Token:", token); // Tambahkan ini untuk cek token
      res.status(200).json({ message: "Login berhasil.", token });
    } catch (error) {
      res.status(500).json({ message: "Terjadi kesalahan saat login.", error });
    }
  }
  async logout(req, res) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(400)
        .json({ message: "Token diperlukan untuk logout." });
    }

    try {
      const decodedToken = jwt.verify(token, SECRET_KEY);

      const blacklistedToken = await prisma.tokenBlacklist.findUnique({
        where: { token: token },
      });

      if (blacklistedToken) {
        return res
          .status(400)
          .json({ message: "Token sudah diblacklist atau kedaluwarsa." });
      }

      await prisma.tokenBlacklist.create({
        data: {
          token,
          expiredAt: new Date(decodedToken.exp * 1000),
        },
      });

      res
        .status(200)
        .json({ message: "Logout berhasil. Token telah di-blacklist." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Terjadi kesalahan saat proses logout.",
        error: error.message || error,
      });
    }
  }
}

module.exports = new AuthController();
