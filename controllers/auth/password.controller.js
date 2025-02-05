const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendForgotPasswordEmail } = require("../auth/mailer.controller");

class PasswordController {
  static async forgetPassword(req, res) {
    const { email } = req.body;

    try {
      // Cek apakah user dengan email tersebut ada
      const user = await prisma.users.findUnique({
        where: { user_email: email },
      });
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      // Buat token JWT
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Simpan token ke tabel password_reset_tokens (perbaiki nama tabel sesuai schema)
      await prisma.password_reset_tokens.create({
        data: {
          token: token,
          user_id: user.user_id,
        },
      });

      // Buat link reset password
      const resetLink = `${process.env.FRONTEND_RESET_PASSWORD_URL}?token=${token}`;

      // Kirim email dengan link reset password
      await sendForgotPasswordEmail(email, resetLink);
      res.status(200).json({
        message: "Link reset password telah dikirim ke email",
        reset_link: resetLink,
        token,
      });
    } catch (err) {
      console.error("Error:", err.message);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  }

  static async resetPassword(req, res) {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password dan konfirmasi password tidak cocok" });
    }

    try {
      const { email } = jwt.verify(token, process.env.JWT_SECRET);

      const resetToken = await prisma.password_reset_tokens.findFirst({
        where: {
          token,
        },
        include: {
          user: true,
        },
      });

      if (!resetToken || resetToken.user.user_email !== email) {
        return res
          .status(404)
          .json({ message: "Token tidak valid atau sudah kedaluwarsa" });
      }

      if (!resetToken) {
        return res
          .status(404)
          .json({ message: "Token tidak valid atau sudah kedaluwarsa" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.users.update({
        where: { user_id: resetToken.user_id },
        data: { user_password: hashedPassword },
      });

      await prisma.password_reset_tokens.delete({
        where: { id: resetToken.id },
      });

      res.status(200).json({
        message: "Password berhasil direset! Silakan login.",
      });
    } catch (err) {
      console.error("Error:", err.message);
      res
        .status(400)
        .json({ message: "Token tidak valid atau sudah kedaluwarsa" });
    }
  }
}

module.exports = PasswordController;
