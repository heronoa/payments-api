import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

import User from "../entities/User";
import Bcrypt from "../services/bcrypt";
import Costumer from "../entities/Costumers";
import Debt from "../entities/Debt";
import { timestampFromNow } from "./time";

const prisma = new PrismaClient();

async function main() {
  const hash_pass = await bcrypt.hash("123456", 10);
  const hash_token = await bcrypt.hash("test@gmail.com@123456", 10);
  const costumer_id = randomUUID();
  const debt_id = randomUUID();

  const users: User[] = [
    new User(randomUUID(), "test@gmail.com", hash_pass, hash_token, 3),
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
    ),
  ];

  const debts: Debt[] = [
    new Debt(
      debt_id,
      costumer_id,
      1221.54,
      1221.54,
      "pix",
      0.2,
      new Date(Date.now()),
      [new Date(timestampFromNow({ days: 10 }))],
      200,
    ),
  ];

  for (const user of users) {
    await prisma.users.create({
      data: {
        id: user.id,
        email: user.email,
        hash_password: user.hash_password,
        acess_token: user.acess_token,
        permission: user.permission,
      },
    });
  }
  for (const costumer of costumers) {
    await prisma.costumers.create({
      data: {
        debt_ids: costumer.debt_ids,
        costumer_id: costumer.costumer_id,
        email: costumer.email,
        name: costumer.name,
        phone: costumer.phone,
        last_name: costumer.last_name,
        adress: costumer.adress,
        cep: costumer.cep,
      },
    });
  }

  for (const debt of debts) {
    await prisma.debts.create({
      data: {
        debt_id: debt.debt_id,
        costumer_id: debt.costumer_id,
        due_dates: debt.due_dates,
        fee: debt.fee,
        value: debt.value,
        payed: debt.payed,
        initial_date: debt.initial_date,
        initial_value: debt.initial_value,
        payment_method: debt.payment_method,
      },
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
