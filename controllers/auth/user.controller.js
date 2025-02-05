const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

class UserController {
  static async getAllUsers(req, res) {
    try {
      const users = await prisma.users.findMany();

      res.status(200).json({
        message: "Daftar pengguna berhasil diambil",
        data: users,
      });
    } catch (error) {
      console.error("Error fetching all users:", error.message);
      res.status(500).json({ message: "Gagal mengambil daftar pengguna" });
    }
  }

  static async getUserById(req, res) {
    // Mengambil user_id dari request yang sudah di-set pada middleware
    const userId = req.user.user_id;

    try {
      const user = await prisma.users.findUnique({
        where: { user_id: userId }, // Menggunakan user_id yang diambil dari token
      });

      if (!user) {
        return res.status(404).json({
          message: "Pengguna tidak ditemukan",
        });
      }

      res.status(200).json({
        message: "Pengguna ditemukan",
        data: user,
      });
    } catch (error) {
      console.error("Error fetching user by ID:", error.message);
      res.status(500).json({ message: "Gagal mengambil data pengguna" });
    }
  }

  static async editUser(req, res) {
    const userId = req.user.user_id; // Mengambil user_id dari payload JWT
    const { user_name, user_email, user_phone, user_password } = req.body;

    try {
      const updateData = {
        user_name,
        user_email,
        user_phone,
      };

      if (user_password) {
        const hashedPassword = await bcrypt.hash(user_password, 10);
        updateData.user_password = hashedPassword;
      }

      const updatedUser = await prisma.users.update({
        where: { user_id: userId }, // Menggunakan user_id dari payload JWT
        data: updateData,
      });

      await prisma.notifications.create({
        data: {
          user_id: updatedUser.user_id,
          notification_type: "USER_DATA_UPDATE",
          notification_message: `Perubahan profil berhasil!`,
          notification_is_read: false,
        },
      });

      return res.status(200).json({
        message: "User berhasil diperbarui",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error editing user:", error.message);
      res.status(500).json({ message: "Gagal memperbarui user" });
    }
  }

  static async deleteUser(req, res) {
    const userId = req.user.user_id; // Mengambil user_id dari payload JWT

    try {
      // Menghapus pengguna berdasarkan user_id yang diambil dari JWT
      await prisma.users.delete({
        where: { user_id: userId }, // Menggunakan user_id dari token
      });

      res.status(200).json({ message: "User berhasil dihapus" });
    } catch (error) {
      console.error("Error deleting user:", error.message);
      res.status(500).json({ message: "Gagal menghapus user" });
    }
  }
}

module.exports = UserController;
