const ProfileAsesi = require("../../models/profileAsesi.model");
const response = require("../../utils/response.util");

exports.getProfile = async (req, res) => {
  try {
    const data = await ProfileAsesi.findByPk(req.user.id_user);
    if (!data) {
      return response.error(res, "Profil asesi tidak ditemukan", 404);
    }
    response.success(res, "Profil asesi", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const [affectedRows] = await ProfileAsesi.update(req.body, {
      where: { id_user: req.user.id_user }
    });

    if (affectedRows === 0) {
      return response.error(res, "Tidak ada perubahan atau profil tidak ditemukan", 404);
    }

    const updatedData = await ProfileAsesi.findByPk(req.user.id_user);
    response.success(res, "Profil asesi diperbarui", updatedData);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.uploadDokumen = async (req, res) => {
  try {
    const files = req.files;
    const updateData = {};

    if (files.pas_foto) updateData.pas_foto = files.pas_foto[0].path;
    if (files.ktp) updateData.ktp = files.ktp[0].path;
    if (files.ijazah) updateData.ijazah = files.ijazah[0].path;
    if (files.transkrip) updateData.transkrip = files.transkrip[0].path;
    if (files.kk) updateData.kk = files.kk[0].path;
    if (files.surat_kerja) updateData.surat_kerja = files.surat_kerja[0].path;

    const [affectedRows] = await ProfileAsesi.update(updateData, {
      where: { id_user: req.user.id_user }
    });

    if (affectedRows === 0) {
      return response.error(res, "Upload gagal atau profil tidak ditemukan", 404);
    }

    const updatedData = await ProfileAsesi.findByPk(req.user.id_user);
    response.success(res, "Dokumen berhasil diupload", updatedData);
  } catch (err) {
    response.error(res, err.message);
  }
};