import { Request, Response } from "express";

import { prisma } from "../../../../prisma/prismaClient";
import Debt from "../../../entities/Debt";

export class DebtsController {
  // TODO: adicionar queries para filtrar dividas ativas e dividas fora do prazo
  static async getAllDebts(req: Request, res: Response) {
    const result = await prisma.debts.findMany();

    if (result) {
      res.status(200).json({ result });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async addDebt(req: Request, res: Response) {
    const { debt_id, costumer_id, due_dates, fee, value, payed } = req.body;

    const result = await prisma.debts.create({
      data: new Debt(debt_id, costumer_id, due_dates, fee, value, payed),
    });

    if (result) {
      res.status(200).json({ message: "Debt Added Sucessfully" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async ping(req: Request, res: Response) {
    res.status(200).json({ res: "pong" });
  }
}
