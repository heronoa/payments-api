import { Request, Response } from "express";

import { prisma } from "../../../../prisma/prismaClient";
import Costumer from "../../../entities/Costumers";

export class CostumersController {
  // TODO: adicionar queries para filtrar cliente sem dividas, dividas ativas e dividas fora do prazo

  static async getAllCostumers(req: Request, res: Response) {
    const result = await prisma.costumers.findMany();

    if (result) {
      res.status(200).json({ result });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async addCostumer(req: Request, res: Response) {
    const {
      debt_ids,
      costumer_id,
      email,
      name,
      last_name,
      phone,
      adress,
      cep,
    } = req.body;

    const result = await prisma.costumers.create({
      data: new Costumer(
        costumer_id,
        debt_ids,
        name,
        last_name,
        phone,
        email,
        adress,
        cep,
      ),
    });

    if (result) {
      res.status(200).json({ message: "Costumer Added Sucessfully" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async ping(req: Request, res: Response) {
    res.status(200).json({ res: "pong" });
  }
}
