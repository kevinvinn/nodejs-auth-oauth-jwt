const express = require("express");
const app = express();

const passport = require("passport");
const AuthMiddleware = require("../middleware/auth");
const authController = require("../controllers/auth/auth.controller");
const RegisterController = require("../controllers/auth/register/register.controller");
const OtpController = require("../controllers/auth/register/otp.controller");
const PasswordController = require("../controllers/auth/password.controller");
const UserController = require("../controllers/auth/user.controller");

//auth & reset password
app.post(
  "/api/v1/auth/register",
  AuthMiddleware.validateRegister,
  RegisterController.register
);

app.post("/api/v1/auth/verify-otp", OtpController.verifyOtp);
app.post("/api/v1/auth/resend-otp", OtpController.resendOtp);
app.post("/api/v1/auth/login", authController.login);
app.post("/api/v1/auth/logout", authController.logout);
app.post("/api/v1/auth/forget-password", PasswordController.forgetPassword);
app.post(
  "/api/v1/auth/reset-password",
  AuthMiddleware.validateResetPassword,
  PasswordController.resetPassword
);

//oauth
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
//callback oauth setelah login
app.get(
  "/auth/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.send(`Halo ${req.user.user_name}, Anda berhasil login dengan OAuth!`);
  }
);

//user
app.get(
  "/api/v1/user/all-users",
  AuthMiddleware.authenticateUser,
  UserController.getAllUsers
);
app.get(
  "/api/v1/user/get-user",
  AuthMiddleware.authenticateUser,
  UserController.getUserById
);
app.put(
  "/api/v1/user/update-user",
  AuthMiddleware.authenticateUser,
  AuthMiddleware.validateEditUser,
  UserController.editUser
);
app.delete(
  "/api/v1/user/delete-user",
  AuthMiddleware.authenticateUser,
  UserController.deleteUser
);

module.exports = app;
