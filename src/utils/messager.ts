import axios from "axios";
import nodemailer from "nodemailer";
import Costumer from "../entities/Costumers";
import Debt from "../entities/Debt";
import { CostumerModel, DebtModel } from "../mongoose/mongodb";
import { UpdateOrCreate } from "../mongoose/utils";

export function sendWppMsg(phone: string) {
  axios.post(
    `https://graph.facebook.com/v19.0/270165959522512/messages`,
    {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: { name: "hello_world", language: { code: "en_US" } },
    },
    {
      headers: {
        Authorization:
          "Bearer EAARKPZC5XFWcBO9XVFrRtogIt5rLsUODS5oX1xBmUZA6kHM9Qb3WDwVHbxDa4BfF6rOMp80XOYq2mEq65KZBZCfWcGK2VtPUZCxflKlUEKtzRNp1ME6ubdZC2l8K3bUhX4CGf1gEniS9LqraZBkk6Q2nlKvWtvAWEZArJ0AQX2k5ZCxLnzvxzEJqPqZCgIPOnyXtiAiiuoHLwCsL7v41ww98YZD",
        "Content-Type": "application/json",
      },
    },
  );
}

export async function sendEmail(costumer: Costumer, debt: Debt) {
  const name = costumer.name;
  const from = "Heron";
  const message = `Sua divida de ${
    debt.description
  } chegou ao prazo final, por isso foi acrescentado uma multa de R$${debt.late_fee.toFixed(
    2,
  )} por dia de atraso e agora o valor total é R$${debt.value}`;
  const to = costumer.email;
  const smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    auth: {
      user: "heronoadev@gmail.com",
      pass: "pcsp gmeh ksnb kkau",
    },
  });
  const mailOptions = {
    from: from,
    to: to,
    subject: name + " | new message !",
    text: message,
  };

  let result;
  let error;
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    }
    result = response;
  });

  return { result, error };
}

export async function mailToLateDebts(lateDebts: Debt[]) {
  try {
    lateDebts.forEach(async debt => {
      try {
        const costumerInDebt = await CostumerModel.findOne({
          costumer_id: debt.costumer_id,
        });

        if (costumerInDebt) {
          const response = await sendEmail(costumerInDebt, debt);

          if (!response?.error) {
            const newCallings = debt.callings + 1;
            UpdateOrCreate(
              DebtModel,
              { debt_id: debt.debt_id },
              { callings: newCallings },
            );
          }
        }
      } catch (err) {
        console.log({ err });
      }
    });
    return lateDebts;
  } catch (error) {
    console.error("Erro ao buscar linhas:", error);
    throw error;
  }
}
