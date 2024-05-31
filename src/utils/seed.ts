import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

import User from "../entities/User";
import Costumer from "../entities/Costumers";
import Debt from "../entities/Debt";
import { timestampFromNow } from "./time";
import { CostumerModel, DebtModel, UserModel } from "../mongoose/mongodb";
import { UpdateOrCreate } from "../mongoose/utils";
import mongoose from "mongoose";

async function main() {
  // mongoose.connection.collections["payments"].drop();

  const hash_pass = await bcrypt.hash("pagamentos@123", 10);
  const hash_token = await bcrypt.hash("pagamentos@gmail.com@123456", 10);
  const costumer_id = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

  const debt_id = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb";
  const user_id = "cccccccc-cccc-cccc-cccc-ccccccccc";

  const users: User[] = [
    new User(user_id, "pagamentos350@gmail.com", hash_pass, hash_token, 3),
  ];

  const costumers: Costumer[] = [
    new Costumer(
      costumer_id,
      [debt_id],
      "Ashton",
      "Kutchen",
      "91912312312",
      "heronoadev@gmail.com",
      "Almirante Barroso, N 90",
      "55555-55",
      "1234567",
      "12345678912",
      "Instagram: @costumer",
    ),
  ];

  const debts: Debt[] = [
    new Debt(
      debt_id,
      costumer_id,
      1000,
      1200,
      "pix",
      0.2,
      new Date(Date.now()),
      [new Date(timestampFromNow({ days: 10 }))],
      200,
      10,
      0,
      "Car rent",
    ),
  ];

  for (const user of users) {
    await UpdateOrCreate(UserModel, { id: user.id }, user);
  }
  for (const costumer of costumers) {
    await UpdateOrCreate(
      CostumerModel,
      { costumer_id: costumer.costumer_id },
      costumer,
    );
  }

  for (const debt of debts) {
    await UpdateOrCreate(DebtModel, { debt_id: debt.debt_id }, debt);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
