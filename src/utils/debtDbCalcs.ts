import Debt from "../entities/Debt";
import { DebtModel } from "../mongoose/mongodb";
import { UpdateOrCreate } from "../mongoose/utils";
import { mailToLateDebts } from "./messager";

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
  console.log({ dataInicial, dataFinal });
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
  try {
    const hoje: Date = new Date();

    for (const debt of debts) {
      const newDoc = JSON.parse(JSON.stringify(debt));
      const currentDueDate = new Date(newDoc.due_dates[newDoc.callings]);
      const numeroDias = getDaysLate(currentDueDate, hoje);
      const feeFactor = Math.pow(1 + newDoc.fee, newDoc.callings + 1); // getFeeFactor(newDoc, hoje);
      const lateFactor = newDoc.late_fee * numeroDias;

      const novoValor = newDoc.initial_value * feeFactor + lateFactor;

      if (novoValor !== newDoc.value) {
        newDoc.value = novoValor;
        try {
          const res = await UpdateOrCreate(
            DebtModel,
            { debt_id: newDoc.debt_id },
            newDoc,
          );
          await mailToLateDebts([newDoc]);
          return res;
        } catch (err) {
          console.log(err);
        }
      } else {
        return { result: true, msg: "late fee already up to date" };
      }
    }
    return { result: false, msg: "debt calculation error" };
  } catch (error) {
    console.error("Erro ao atualizar entradas:", error);
    return { result: false, msg: String(error) };
  }
}
