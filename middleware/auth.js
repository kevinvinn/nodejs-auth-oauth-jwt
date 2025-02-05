const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;

class AuthMiddleware {
  // Middleware untuk autentikasi user
  static async authenticateUser(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token diperlukan untuk akses." });
    }

    try {
      // Periksa apakah token sudah ada di blacklist
      const blacklistedToken = await prisma.tokenBlacklist.findUnique({
        where: { token: token },
      });

      if (blacklistedToken) {
        return res
          .status(401)
          .json({ message: "Token ini sudah diblacklist." });
      }

      // Verifikasi token
      const decoded = jwt.verify(token, SECRET_KEY);

      // Periksa apakah user terkait masih ada
      const user = await prisma.users.findUnique({
        where: { user_id: decoded.userID },
      });

      if (!user) {
        return res.status(401).json({ message: "User tidak ditemukan." });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token tidak valid.", error });
    }
  }

  // Middleware untuk validasi register
  static validateRegister = [
    body("user_name")
      .not()
      .isNumeric()
      .withMessage("Nama tidak boleh berupa angka."),
    body("user_email").isEmail().withMessage("Email tidak valid."),
    body("user_password")
      .isLength({ min: 8 })
      .withMessage("Password minimal 8 karakter."),
    async (req, res, next) => {
      // Validasi format menggunakan express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user_email } = req.body;

      try {
        // Periksa apakah email sudah terdaftar
        const emailExists = await prisma.users.findUnique({
          where: { user_email },
        });

        if (emailExists) {
          return res.status(400).json({
            errors: [{ msg: "Email sudah terdaftar.", param: "user_email" }],
          });
        }

        next();
      } catch (error) {
        console.error("Error saat memeriksa email :", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
      }
    },
  ];

  static validateResetPassword = [
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password minimal 8 karakter."),
    body("confirmPassword")
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Password dan konfirmasi password tidak cocok."),
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ];

  static validateEditUser = [
    body("user_name")
      .optional()
      .not()
      .isNumeric()
      .withMessage("Nama tidak boleh berupa angka."),
    body("user_email").optional().isEmail().withMessage("Email tidak valid."),
    body("user_password")
      .optional()
      .isLength({ min: 8 })
      .withMessage("Password minimal 8 karakter."),
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      next();
    },
  ];
}

module.exports = AuthMiddleware;
