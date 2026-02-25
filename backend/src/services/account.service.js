const bcrypt = require("bcryptjs");
const { User } = require("../models");
const Notifikasi = require("../models/notifikasi.model");

exports.createUserWithNotification = async (
  {
    username,
    email,
    no_hp,
    id_role
  },
  { transaction }
) => {

  const rawPassword = Math.random().toString(36).slice(-8);
  const password_hash = await bcrypt.hash(rawPassword, 10);

  // 1️⃣ CREATE USER
  const user = await User.create({
    username,
    password_hash,
    id_role,
    email,
    no_hp
  }, { transaction });

  // 2️⃣ CREATE NOTIFIKASI (PENDING DULU)
  const notifikasi = await Notifikasi.create({
    channel: "email",
    tujuan: email,
    pesan: `Akun berhasil dibuat. Username: ${username}`,
    waktu_kirim: new Date(),
    status_kirim: "pending",
    ref_type: "akun",
    ref_id: user.id_user
  }, { transaction });

  return {
    user,
    rawPassword,
    notifikasi
  };
};