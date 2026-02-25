const { Surveillance, User, Skema, ProfileAsesi } = require("../../models");
const response = require("../../utils/response.util");

exports.getAllSurveillance = async (req, res) => {
  try {
    const data = await Surveillance.findAll({
      include: [
        {
          model: User,
          attributes: ["id_user", "email"],
          include: [
            {
              model: ProfileAsesi,
              attributes: ["nama_lengkap", "nik"],
            },
          ],
        },
        {
          model: Skema,
          attributes: ["id_skema", "judul_skema"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return response.success(res, "List surveillance", data);
  } catch (err) {
    console.error("ADMIN GET SURVEILLANCE ERROR:", err);
    return response.error(res, err.message);
  }
};

exports.updateStatusSurveillance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_verifikasi } = req.body;

    const allowed = ["submitted", "review", "valid", "tidak_valid"];

    if (!allowed.includes(status_verifikasi)) {
      return response.error(res, "Status tidak valid", 400);
    }

    const data = await Surveillance.findByPk(id);

    if (!data) {
      return response.error(
        res,
        "Data surveillance tidak ditemukan",
        404
      );
    }

    await data.update({ status_verifikasi });

    return response.success(
      res,
      "Status berhasil diupdate",
      data
    );
  } catch (err) {
    console.error("UPDATE STATUS SURVEILLANCE ERROR:", err);
    return response.error(res, err.message);
  }
};