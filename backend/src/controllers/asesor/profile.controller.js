const ProfileAsesor = require("../../models/profileAsesor.model");
const response = require("../../utils/response.util");

exports.getProfile = async (req, res) => {
  try {
    const data = await ProfileAsesor.findByPk(req.user.id_user);
    response.success(res, "Profil asesor", data);
  } catch (err) {
    response.error(res, err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    await ProfileAsesor.update(req.body, {
      where: { id_user: req.user.id_user }
    });
    response.success(res, "Profil asesor diperbarui");
  } catch (err) {
    response.error(res, err.message);
  }
};
