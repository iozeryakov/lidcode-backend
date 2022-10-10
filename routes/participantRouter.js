const Router = require("express");
const router = new Router();
const participantController = require("../controllers/participantController");
const authMiddleware = require("../middleware/authMiddleware");
router.post("/", authMiddleware, participantController.create);
router.post("/delete", authMiddleware, participantController.delete);
router.post("/update", authMiddleware, participantController.update);
router.get("/free", authMiddleware, participantController.getFree);
router.get("/", authMiddleware, participantController.getAll);
router.get("/:id", authMiddleware, participantController.getOne);

module.exports = router;
