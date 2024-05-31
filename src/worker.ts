/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import cron from "node-cron";
import { DebtModel } from "./mongoose/mongodb";
import { updateDebtValueByLateFee } from "./utils/debtDbCalcs";
import { mailToLateDebts, wppToLateDebts } from "./utils/messager";

const DAILY_9_CRON_SCHEDULE = "0 0 9 * * *"; // Todo dia as (9:00)
const DAILY_7_CRON_SCHEDULE = "0 0 22 * * *"; // Todo dia as (9:00)

export async function cronJobs() {
  try {
    cron.schedule(DAILY_7_CRON_SCHEDULE, async () => {
      const allDebts = await DebtModel.find();
      const lateDebts = allDebts.filter(debt => {
        if (debt.value > debt.payed) return true;
      });

      try {
        await updateDebtValueByLateFee(lateDebts);
        // const resMail = await mailToLateDebts(lateDebts);
        // const resWpp = await wppToLateDebts(lateDebts);
      } catch (err) {
        console.log({ err });
      }
    });
    cron.schedule(DAILY_9_CRON_SCHEDULE, async () => {
      const allDebts = await DebtModel.find();
      const lateDebts = allDebts.filter(debt => {
        if (debt.value > debt.payed) return true;
      });

      try {
        // const lateFeeResult = await updateDebtValueByLateFee(lateDebts);
        await mailToLateDebts(lateDebts);
        // const resWpp = await wppToLateDebts(lateDebts);
      } catch (err) {
        console.log({ err });
      }
    });
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
