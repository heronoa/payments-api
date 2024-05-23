import Debt from "../entities/Debt";
import { DebtModel } from "../mongoose/mongodb";
import { UpdateOrCreate } from "../mongoose/utils";
import { mailToLateDebts } from "./messager";
import { timestampFromNow } from "./time";

export async function atualizarValorPelaMulta(): Promise<void> {
  try {
    const hoje: Date = new Date();

    const result = await DebtModel.updateMany(
      { date: { $lt: hoje } },
      { $set: { value: { $sum: ["$value", "$fee"] } } },
    );

    console.log(`${result.modifiedCount} entradas foram atualizadas.`);
  } catch (error) {
    console.error("Erro ao atualizar entradas:", error);
  }
}

export async function atualizarValorPelaTaxa() {
  try {
    const hoje: Date = new Date();

    const result = await DebtModel.updateMany(
      { date: { $lt: hoje } },
      { $mul: { value: { $add: ["$value", { $add: [1, "$fee"] }] } } },
    );

    console.log(`${result.modifiedCount} entradas foram atualizadas.`);
  } catch (error) {
    console.error("Erro ao atualizar entradas:", error);
  }
}

function getDaysLate(dataInicial: Date, dataFinal: Date): number {
  const umDiaEmMilissegundos = 1000 * 60 * 60 * 24;
  const diferencaEmMilissegundos = dataFinal.getTime() - dataInicial.getTime();
  return Math.floor(diferencaEmMilissegundos / umDiaEmMilissegundos);
}
function getFeeFactor(doc: Debt, hoje: Date): number {
  // if (doc.due_dates[doc.callings].getTime() < hoje.getTime()) {
  //   return doc.initial_value * doc.fee;
  // }

  return 0;
}

export async function updateDebtValueByLateFee(debts: Debt[]): Promise<{
  result: boolean;
  msg: string;
}> {
  const log = [];

  try {
    const hoje: Date = new Date();

    for (const debt of debts) {
      const newDoc = JSON.parse(JSON.stringify(debt));
      const currentDueDate = new Date(
        newDoc?.due_dates?.[newDoc?.callings] ||
          newDoc.due_dates[newDoc.due_dates.length - 1],
      );
      const dues_date = newDoc?.due_dates;
      const len = newDoc?.due_dates.length;
      const lastDueDate = new Date(dues_date[len - 1]);

      if (currentDueDate?.getTime() === lastDueDate?.getTime()) {
        const initDate =
          len > 1
            ? new Date(newDoc?.due_dates?.[newDoc?.due_dates?.length - 2])
            : new Date(newDoc?.initial_date);

        console.log("checking", { currentDueDate, lastDueDate, initDate });
        const daysPeriod = getDaysLate(initDate, lastDueDate);
        console.log({ daysPeriod });
        const nextDates = new Array(4).fill(0).map((_, i) => {
          const daysCount = (i + 1) * daysPeriod;

          return new Date(
            timestampFromNow({
              initial_date: lastDueDate,
              days: daysCount,
            }),
          );
        });
        console.log({ nextDates });

        const novasDatas = [...newDoc?.due_dates, ...nextDates];
        newDoc.due_dates = novasDatas;
        // console.log({ novasDatas });
      }
      const numeroDias = getDaysLate(currentDueDate, hoje);
      const callings = newDoc.callings + 1;
      const fee = newDoc.fee + 1;
      const feeFactor = Math.pow(fee, callings); // getFeeFactor(newDoc, hoje);
      const lateFactor = newDoc.late_fee * numeroDias;

      const novoValor = newDoc.initial_value * feeFactor + lateFactor;
      console.log({ feeFactor });

      if (novoValor !== newDoc.value) {
        newDoc.value = novoValor;
        try {
          console.log({
            newDoc,
          });

          const res = await UpdateOrCreate(
            DebtModel,
            { debt_id: newDoc.debt_id },
            newDoc,
          );
          await mailToLateDebts([newDoc]);
          log.push(res);
        } catch (err) {
          console.log({
            result: false,
            msg: "debt calculation error",
            details: err,
          });
          log.push({
            result: false,
            msg: "debt calculation error",
            details: err,
          });
        }
      } else {
        console.log({
          result: true,
          msg: "late fee already up to date",
        });
      }
    }
  } catch (error) {
    console.error("Erro ao atualizar entradas:", error);
    log.push({ result: false, msg: String(error) });
  }
  return { result: true, msg: JSON.stringify(log) };
}
