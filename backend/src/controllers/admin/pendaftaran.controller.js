const bcrypt = require("bcryptjs");
const Pendaftaran = require("../../models/pendaftaranAsesi.model");
const ProfileAsesi = require("../../models/profileAsesi.model");
const Role = require("../../models/role.model");
const User = require("../../models/user.model");
const Notifikasi = require("../../models/notifikasi.model");
const { sendAccountEmail } = require("../../services/email.service");
const response = require("../../utils/response.util");

exports.getAll = async (req, res) => {
  try {
    const data = await Pendaftaran.findAll({
      order: [["tanggal_daftar", "DESC"]]
    });

    response.success(res, "List pendaftaran asesi", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.approvePendaftaran = async (req, res) => {
  try {
    const pendaftaran = await Pendaftaran.findByPk(req.params.id);

    if (!pendaftaran) {
      return response.error(res, "Data tidak ditemukan", 404);
    }

    if (pendaftaran.status === "approved") {
      return response.error(
        res,
        "Pendaftaran sudah pernah di-approve",
        400
      );
    }

    const roleAsesi = await Role.findOne({
      where: { role_name: "ASESI" }
    });

    if (!roleAsesi) {
      return response.error(res, "Role asesi tidak ditemukan", 500);
    }

    const username = pendaftaran.nik;
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await User.create({
      username,
      password_hash: hashedPassword,
      id_role: roleAsesi.id_role,
      email: pendaftaran.email,
      no_hp: pendaftaran.no_hp
    });

    await ProfileAsesi.create({
      id_user: user.id_user,
      nik: pendaftaran.nik,
      nama_lengkap: pendaftaran.nama_lengkap,
      provinsi: pendaftaran.provinsi,
      kota: pendaftaran.kota,
      kecamatan: pendaftaran.kecamatan,
      kelurahan: pendaftaran.kelurahan
    });

    await pendaftaran.update({
      status: "approved"
    });

    let statusKirim = "terkirim";

    try {
      await sendAccountEmail(
        pendaftaran.email,
        username,
        rawPassword
      );
    } catch (e) {
      console.error("Email gagal:", e.message);
      statusKirim = "gagal";
    }

    await Notifikasi.create({
      channel: "email",
      tujuan: pendaftaran.email,
      pesan: `Akun asesi berhasil dibuat. Username: ${username}`,
      waktu_kirim: new Date(),
      status_kirim: statusKirim,
      ref_type: "akun",
      ref_id: user.id_user
    });

    return response.success(
      res,
      "Akun asesi berhasil dibuat & dikirim ke email"
    );
  } catch (err) {
    console.error(err);
    return response.error(res, err.message);
  }
};

exports.rejectPendaftaran = async (req, res) => {
  try {
    const pendaftaran = await Pendaftaran.findByPk(req.params.id);

    if (!pendaftaran) {
      return response.error(res, "Data tidak ditemukan", 404);
    }

    if (pendaftaran.status !== "pending") {
      return response.error(
        res,
        "Pendaftaran sudah diproses sebelumnya",
        400
      );
    }

    await pendaftaran.update({
      status: "rejected"
    });

    await Notifikasi.create({
      channel: "email",
      tujuan: pendaftaran.email,
      pesan: "Pendaftaran Anda ditolak oleh admin",
      waktu_kirim: new Date(),
      status_kirim: "terkirim",
      ref_type: "pendaftaran",
      ref_id: pendaftaran.id_pendaftaran
    });

    return response.success(res, "Pendaftaran berhasil ditolak");
  } catch (err) {
    console.error(err);
    return response.error(res, err.message);
  }
};
