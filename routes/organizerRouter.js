const Router = require("express");
const router = new Router();
const organizerController = require("../controllers/organizerController");
const authMiddleware = require("../middleware/authMiddleware");
router.post("/", authMiddleware, organizerController.create);
router.post("/delete", authMiddleware, organizerController.delete);
router.post("/update", authMiddleware, organizerController.update);
router.get("/", authMiddleware, organizerController.getAll);
router.get("/free", authMiddleware, organizerController.getFree);
router.get("/:id", authMiddleware, organizerController.getOne);

module.exports = router;
