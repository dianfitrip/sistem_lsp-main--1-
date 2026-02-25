const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const profileController = require("../controllers/asesor/profile.controller");
const jadwalAsesorController = require("../controllers/asesor/jadwal.controller");
const pesertaJadwalController = require("../controllers/asesor/pesertaJadwal.controller");
const mkvaController = require("../controllers/asesor/mkva.controller");

router.use(authMiddleware, roleMiddleware.asesorOnly);

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

router.get("/jadwal-saya", jadwalAsesorController.getJadwalSaya);

router.put("/peserta/:id/nilai", pesertaJadwalController.updateNilaiPeserta);

router.get("/mkva/jadwal", mkvaController.getJadwalAsesor);
router.get("/mkva/form/:id_jadwal", mkvaController.getFormData);
router.post("/mkva/form/:id_jadwal", mkvaController.submitForm);
router.get("/mkva/download/:id_mkva", mkvaController.downloadForm);
router.get("/mkva/surat-tugas/:id_jadwal", mkvaController.downloadSuratTugas);

module.exports = router;