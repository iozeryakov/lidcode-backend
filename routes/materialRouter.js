const Router = require("express");
const router = new Router();
const materialController = require("../controllers/materialController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, materialController.create);
router.post("/delete", authMiddleware, materialController.delete);
router.post("/update", authMiddleware, materialController.update);
router.get("/", authMiddleware, materialController.getAll);
router.get("/free", authMiddleware, materialController.getFree);
router.get("/:id", authMiddleware, materialController.getOne);

module.exports = router;
