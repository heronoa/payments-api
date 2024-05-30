import axios from "axios";
import nodemailer from "nodemailer";
import Costumer from "../entities/Costumers";
import Debt from "../entities/Debt";
import { CostumerModel, DebtModel } from "../mongoose/mongodb";
import { UpdateOrCreate } from "../mongoose/utils";
import { getClosestDate } from "./time";
import { getDaysLate } from "./debtDbCalcs";

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

export async function sendEmail(costumer: Costumer, debt: Debt, msg?: string) {
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
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: from,
    to: to,
    subject: name + " | new message !",
    text: msg,
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
export async function sendRecoverEmail(email: string, msg?: string) {
  const from = "Heron";
  const message = msg;
  const to = email;
  const smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: from,
    to: to,
    subject: "Recuperação de senha - Payments - Não responda",
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

export async function mailToLateDebts(lateDebts: Debt[], type = "late") {
  try {
    lateDebts.forEach(async debt => {
      try {
        const costumerInDebt = await CostumerModel.findOne({
          costumer_id: debt.costumer_id,
        });

        const checkClosestDate = getClosestDate(debt.due_dates);
        const daysLateCheck = checkClosestDate?.data
          ? getDaysLate(new Date(checkClosestDate?.data)) <= 1
          : false;

        if (costumerInDebt && daysLateCheck) {
          const response = await sendEmail(
            costumerInDebt,
            debt,
            emailExample?.[type]({
              value: debt.value,
              date: checkClosestDate?.data
                ?.toISOString()
                ?.split("T")?.[0]
                ?.split("-")
                .reverse()
                .join("/"),
              description: debt.description,
              name: costumerInDebt.last_name,
            }) || undefined,
          );

          return response;
          // if (!response?.error) {
          //   const newCallings = debt.callings + 1;
          //   UpdateOrCreate(
          //     DebtModel,
          //     { debt_id: debt.debt_id },
          //     { callings: newCallings },
          //   );
          // }
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

const emailExample: {
  [key: string]: (details: {
    [key: string]: string | number | Date | undefined;
  }) => string;
} = {
  late: ({ value, date, description, name }) => `Prezado(a) Sr. ${name}
  Esperamos que este e-mail o encontre bem. Estamos escrevendo para lembrá-lo(a) de que sua dívida conosco venceu.
  Detalhes da dívida:
  
    Novo Valor: R$${Number(value).toFixed(2)}
    Data de Vencimento: ${String(date).split("T")[0].split("-").join("/")}
    Descrição da Dívida: ${description}
  
  Por favor, tome as medidas necessárias para garantir que o pagamento seja feito até a data de vencimento mencionada acima. Se você já efetuou o pagamento, por favor, desconsidere esta mensagem.
  Se precisar de mais informações ou se tiver alguma dúvida, não hesite em nos contatar. Estamos aqui para ajudar.
  Atenciosamente, Heron Amaral
`,
};
