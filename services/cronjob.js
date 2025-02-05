const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Cron job gabungan untuk membersihkan data kedaluwarsa
cron.schedule("0 */2 * * *", async () => {
  const now = new Date();
  try {
    // Hapus token blacklist yang telah kedaluwarsa
    const deletedTokens = await prisma.tokenBlacklist.deleteMany({
      where: { expiredAt: { lt: now } },
    });
    console.log(
      `${deletedTokens.count} token blacklist kedaluwarsa telah dihapus.`
    );

    // Hapus OTP yang telah kedaluwarsa
    const deletedOtps = await prisma.otp.deleteMany({
      where: { otp_expires_at: { lt: now } },
    });
    console.log(`${deletedOtps.count} OTP kedaluwarsa telah dihapus.`);
  } catch (error) {
    console.error("Error saat membersihkan data kedaluwarsa:", error);
  }
});

const cleanOldFiles = (folderPath, expiryInDays) => {
  const now = Date.now();
  const expiryTime = expiryInDays * 24 * 60 * 60 * 1000;

  fs.readdir(folderPath, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) throw err;

        if (now - stats.mtimeMs > expiryTime) {
          fs.unlink(filePath, (err) => {
            if (err) throw err;
            console.log(`Deleted old file: ${file}`);
          });
        }
      });
    });
  });
};

// every 2 AM
cron.schedule("0 2 * * *", () => {
  console.log("Running clean-up task...");
  cleanOldFiles("public/etickets", 7); // Bersihkan file lebih dari 7 hari
});
