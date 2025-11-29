import { Router } from "express";
import authRouter from "../modules/auth/auth.router.js";
import municipalityRouter from "../modules/municipalities/municipality.router.js";
import reportRouter from "../modules/reports/report.router.js";
import staffRouter from "../modules/staffs/staff.router.js";
import sponsorRouter from "../modules/sponsors/sponsor.router.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/municipalities", municipalityRouter);
router.use("/reports", reportRouter);
router.use("/staffs", staffRouter);
router.use("/sponsors", sponsorRouter);


export default router;