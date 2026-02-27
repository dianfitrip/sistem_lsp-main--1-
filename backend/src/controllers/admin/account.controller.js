const bcrypt = require("bcryptjs");
const { User, Notifikasi } = require("../../models");
const response = require("../../utils/response.util");
const { sendAccountEmail } = require("../../services/email.service");

exports.sendAccountEmailManual = async (req, res) => {
  try {

    const user = await User.findByPk(req.params.id);
    if (!user) return response.error(res, "User tidak ditemukan", 404);

    // Cek apakah sudah pernah dikirim
    const existingNotif = await Notifikasi.findOne({
      where: {
        ref_type: "akun",
        ref_id: user.id_user
      }
    });

    if (existingNotif) {
      return response.error(res, "Email sudah pernah dikirim", 400);
    }

    // Generate password baru
    const rawPassword = Math.random().toString(36).slice(-8);
    const password_hash = await bcrypt.hash(rawPassword, 10);

    await user.update({ password_hash });

    try {

      await sendAccountEmail(
        user.email,
        user.username,
        rawPassword
      );

      await Notifikasi.create({
        channel: "email",
        tujuan: user.email,
        pesan: `Akun berhasil dibuat. Username: ${user.username}`,
        waktu_kirim: new Date(),
        status_kirim: "terkirim",
        ref_type: "akun",
        ref_id: user.id_user
      });

      return response.success(res, "Email berhasil dikirim");

    } catch (err) {

      await Notifikasi.create({
        channel: "email",
        tujuan: user.email,
        pesan: `Gagal kirim email akun`,
        waktu_kirim: new Date(),
        status_kirim: "gagal",
        ref_type: "akun",
        ref_id: user.id_user
      });

      return response.error(res, "Gagal mengirim email");
    }

  } catch (err) {
    return response.error(res, err.message);
  }
};