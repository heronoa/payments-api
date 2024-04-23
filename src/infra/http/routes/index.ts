import { Router } from "express";

import { authMiddleware } from "../../../middlewares/auth";
import { AuthController } from "../controllers/AuthController";
import { CostumersController } from "../controllers/CostumersController";
import { DebtsController } from "../controllers/DebtsController";

const router = Router();

router.post("/login", AuthController.token);
router.get("/authping", authMiddleware, AuthController.ping);
router.get("/costumers", authMiddleware, CostumersController.getAllCostumers);
router.get("/debts", authMiddleware, DebtsController.getAllDebts);
router.post("/adddebt", authMiddleware, DebtsController.addDebt);
router.post("/addcostumer", authMiddleware, CostumersController.addCostumer);

export default router;
