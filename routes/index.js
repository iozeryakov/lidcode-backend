const Router = require("express");
const router = new Router();
const materialRouter = require("./materialRouter");
const organizerRouter = require("./organizerRouter");
const sponsorRouter = require("./sponsorRouter");
const participantRouter = require("./participantRouter");
const teamRouter = require("./teamRouter");
const userRouter = require("./userRouter");
const eventRouter = require("./eventRouter");

router.use("/material", materialRouter);
router.use("/organizer", organizerRouter);
router.use("/sponsor", sponsorRouter);
router.use("/participant", participantRouter);
router.use("/team", teamRouter);
router.use("/user", userRouter);
router.use("/event", eventRouter);

module.exports = router;
