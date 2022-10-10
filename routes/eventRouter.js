const Router = require("express");
const router = new Router();
const eventController = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, eventController.create);
router.post("/delete", authMiddleware, eventController.delete);
router.post("/update", authMiddleware, eventController.update);
router.get("/open", eventController.getOpen);
router.get("/", authMiddleware, eventController.getAll);
router.get("/:id", eventController.getOne);

module.exports = router;
