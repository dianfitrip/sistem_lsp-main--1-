const { BandingAsesmen, User } = require("../../models");
const response = require("../../utils/response.util");

const getAllBanding = async (req, res) => {
  try {
    const data = await BandingAsesmen.findAll({
      include: [{ model: User, as: "user" }],
      order: [["tanggal_ajukan", "DESC"]]
    });

    return response.success(res, "List banding", data);
  } catch (err) {
    return response.error(res, err.message);
  }
};

const updateStatusBanding = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_progress, keputusan, catatan_komite } = req.body;

    const banding = await BandingAsesmen.findByPk(id);
    if (!banding) {
      return response.error(res, "Banding tidak ditemukan", 404);
    }

    await banding.update({
      status_progress,
      keputusan,
      catatan_komite,
      tanggal_putusan:
        keputusan !== "belum_diputus" ? new Date() : null
    });

    return response.success(res, "Banding berhasil diupdate", banding);
  } catch (err) {
    return response.error(res, err.message);
  }
};

module.exports = {
  getAllBanding,
  updateStatusBanding
};