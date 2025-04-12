import express from "express";
import { voteCheckController, insertVoteController } from "../controllers/voteController";

const router = express.Router();

router.get("/voteCheck", voteCheckController);
router.push("/", insertVoteController);

export default router;