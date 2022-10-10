const Router = require("express");
const router = new Router();
const sponsorController = require("../controllers/sponsorController");
const authMiddleware = require("../middleware/authMiddleware");
router.post("/", authMiddleware, sponsorController.create);
router.post("/delete", authMiddleware, sponsorController.delete);
router.post("/update", authMiddleware, sponsorController.update);
router.get("/", authMiddleware, sponsorController.getAll);
router.get("/free", authMiddleware, sponsorController.getFree);
router.get("/:id", authMiddleware, sponsorController.getOne);

module.exports = router;
