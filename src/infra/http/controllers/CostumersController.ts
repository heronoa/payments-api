import { Request, Response } from "express";

import { prisma } from "../../../../prisma/prismaClient";
import Costumer from "../../../entities/Costumers";
import { randomUUID } from "crypto";
import { CostumerModel, DebtModel } from "../../../mongoose/mongodb";
import { UpdateOrCreate } from "../../../mongoose/utils";

export class CostumersController {
  // TODO: adicionar queries para filtrar cliente sem dividas, dividas ativas e dividas fora do prazo

  static async getAllCostumers(req: Request, res: Response) {
    const query = req?.query || {};
    const result = await CostumerModel.find({ ...query });

    if (result) {
      res.status(200).json({ result });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  static async getSingleCostumer(req: Request, res: Response) {
    const params = req.params.id as string;
    const query = req?.query || {};
    const result = await CostumerModel.find({ costumer_id: params, ...query });

    if (result) {
      res.status(200).json({ result });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async addCostumer(req: Request, res: Response) {
    const {
      debts_ids,
      email,
      name,
      last_name,
      phone,
      adress,
      cep,
      rg,
      cpf,
      details,
    } = req.body;

    const costumer_id = randomUUID();

    const newCostumerData = new Costumer(
      costumer_id,
      debts_ids,
      name,
      last_name,
      phone,
      email,
      adress,
      cep,
      rg,
      cpf,
      details,
    );

    const dbres = await UpdateOrCreate(
      CostumerModel,
      { costumer_id: newCostumerData.costumer_id },
      newCostumerData,
    );

    console.log({ dbres });

    if (dbres.result) {
      res.status(200).json({
        message: "Costumer Added Sucessfully",
        costumer_id: costumer_id,
      });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  static async updateCostumer(req: Request, res: Response) {
    const updateObj = JSON.parse(JSON.stringify(req.body));

    for (let key in updateObj) {
      if (updateObj[key] === undefined) {
        if (key === "costumer_id") {
          return res.status(422).json({
            error: "Missing costumer id to update",
          });
        }

        delete updateObj[key];
      }
    }

    const result = await UpdateOrCreate(
      CostumerModel,
      {
        costumer_id: updateObj.costumer_id,
      },
      updateObj,
    ).catch(err =>
      res.status(500).json({
        message: "DB error",
        details: err,
      }),
    );

    if (result) {
      res.status(200).json({
        message: "Costumer Update Sucessfully",
        costumer_id: updateObj.costumer_id,
      });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async removeCostumer(req: Request, res: Response) {
    if (!req?.body?.costumer_id) {
      return res.status(422).json({ error: "Missing Parameter costumer_id" });
    }

    const { costumer_id } = req.body;

    const costumerResult = await CostumerModel.findOneAndDelete({
      costumer_id,
    });
    const debtsResult = await DebtModel.deleteMany({ costumer_id });

    if (costumerResult && debtsResult) {
      res.status(200).json({
        message: "Costumer Removed Sucessfully",
      });
    } else {
      res
        .status(500)
        .json({ error: "Internal Server Error", costumerResult, debtsResult });
    }
  }
}
