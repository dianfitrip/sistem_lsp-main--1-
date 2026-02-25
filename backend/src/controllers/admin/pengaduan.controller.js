const Pengaduan = require("../../models/pengaduan.model");
const response = require("../../utils/response.util");

exports.getAll = async (req, res) => {
  try {
    const data = await Pengaduan.findAll();
    response.success(res, "List pengaduan", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const pengaduan = await Pengaduan.findByPk(req.params.id);
    if (!pengaduan)
      return response.error(res, "Pengaduan tidak ditemukan", 404);

    pengaduan.status_pengaduan = req.body.status_pengaduan;
    await pengaduan.save();

    response.success(res, "Status pengaduan berhasil diperbarui");
  } catch (err) {
    response.error(res, err.message);
  }
};
