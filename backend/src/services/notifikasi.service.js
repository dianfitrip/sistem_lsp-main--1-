const Notifikasi = require("../models/notifikasi.model");

exports.createNotifikasi = async ({
  channel,
  tujuan,
  pesan,
  status_kirim,
  ref_type,
  ref_id
}) => {
  try {
    return await Notifikasi.create({
      channel,
      tujuan,
      pesan,
      waktu_kirim: new Date(),
      status_kirim,
      ref_type,
      ref_id
    });
  } catch (error) {
    console.error("❌ Error simpan notifikasi:", error);
    throw error;
  }
};
