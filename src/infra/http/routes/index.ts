import { Router } from "express";

import { authMiddleware } from "../../../middlewares/auth";
import { AuthController } from "../controllers/AuthController";
import { CostumersController } from "../controllers/CostumersController";
import { DebtsController } from "../controllers/DebtsController";

const router = Router();

router.post("/login", AuthController.token);
router.get("/authping", authMiddleware, AuthController.ping);
router.get("/costumers", authMiddleware, CostumersController.getAllCostumers);
router.get(
  "/costumers/:id",
  authMiddleware,
  CostumersController.getSingleCostumer,
);
router.get("/debts", authMiddleware, DebtsController.getAllDebts);
router.get("/debts/:id", authMiddleware, DebtsController.getSingleDebt);
router.post("/debts/add", authMiddleware, DebtsController.addDebt);
router.post("/debts/update", authMiddleware, DebtsController.updateDebt);
router.post("/debts/remove", authMiddleware, DebtsController.removeDebt);
router.post("/costumers/add", authMiddleware, CostumersController.addCostumer);
router.post(
  "/costumers/remove",
  authMiddleware,
  CostumersController.removeCostumer,
);
router.post(
  "/costumers/update",
  authMiddleware,
  CostumersController.updateCostumer,
);
router.get("/debt/getlate", authMiddleware, DebtsController.sendLateMessages);

export default router;
