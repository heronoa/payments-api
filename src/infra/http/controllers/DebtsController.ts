import { Request, Response } from "express";

import { prisma } from "../../../../prisma/prismaClient";
import Debt from "../../../entities/Debt";
import { randomUUID } from "crypto";
import { CostumerModel, DebtModel } from "../../../mongoose/mongodb";
import { UpdateOrCreate } from "../../../mongoose/utils";

export class DebtsController {
  // TODO: adicionar queries para filtrar dividas ativas e dividas fora do prazo
  static async getAllDebts(req: Request, res: Response) {
    const result = await DebtModel.find({});

    if (result) {
      res.status(200).json({ result });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  static async getSingleDebt(req: Request, res: Response) {
    const params = req.params.id as string;
    const query = req.query || {};
    console.log({ params, query });
    const result = await DebtModel.find({
      debt_id: params,
      ...query,
    });

    if (result) {
      res.status(200).json({ result });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async addDebt(req: Request, res: Response) {
    const {
      costumer_id,
      due_dates,
      fee,
      value,
      payed,
      initial_value,
      payment_method,
      initial_date,
    } = req.body;

    const olderDebtIds = (
      await CostumerModel.find({
        where: { costumer_id: costumer_id },
      })
    )[0]?.debt_ids;
    if (!Array.isArray(olderDebtIds)) {
      return res.status(500).json({ error: "DB Find Costumer Error" });
    }

    const debt_id = randomUUID();

    const newDebtData = new Debt(
      debt_id,
      costumer_id,
      value,
      initial_value,
      payment_method,
      fee,
      initial_date,
      due_dates,
      payed,
    );

    const result = await UpdateOrCreate(
      DebtModel,
      { debt_id: newDebtData.debt_id },
      newDebtData,
    );

    if (result.result) {
      const updateResult = await UpdateOrCreate(
        CostumerModel,
        { costumer_id: costumer_id },
        { debt_ids: [...olderDebtIds, debt_id] },
      );

      if (updateResult.result) {
        return res
          .status(200)
          .json({ message: "Debt Added Sucessfully", id: debt_id });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  static async updateDebt(req: Request, res: Response) {
    const updateObj = JSON.parse(JSON.stringify(req.body));

    for (let key in updateObj) {
      if (updateObj[key] === undefined) {
        if (key === "debt_id") {
          return res.status(422).json({
            error: "Missing debt id to update",
          });
        }

        delete updateObj[key];
      }
    }

    const result = await UpdateOrCreate(
      DebtModel,
      {
        debt_id: updateObj.debt_id,
      },
      updateObj,
    );

    if (result) {
      return res
        .status(200)
        .json({ message: "Debt Updated Sucessfully", id: updateObj.debt_id });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async removeDebt(req: Request, res: Response) {
    if (!req?.body?.debt_id) {
      return res.status(422).json({ error: "Missing Parameter debt_id" });
    }

    const { debt_id } = req.body;

    const result = await DebtModel.findOneAndDelete({ debt_id });

    if (result) {
      res.status(200).json({
        message: "Debt Removed Sucessfully",
      });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
