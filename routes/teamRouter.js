const Router = require("express");
const router = new Router();
const teamController = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");
router.post("/", teamController.create);
router.post("/delete", authMiddleware, teamController.delete);
router.post("/new", authMiddleware, teamController.createNew);
router.post("/update", authMiddleware, teamController.update);
router.get("/free", authMiddleware, teamController.getFree);
router.get("/", authMiddleware, teamController.getAll);
router.get("/email", teamController.getCod);

router.get("/:id", authMiddleware, teamController.getOne);

module.exports = router;
