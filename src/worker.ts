/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import cron from "node-cron";
import { CostumerModel, DebtModel } from "./mongoose/mongodb";
import { sendWppMsg } from "./utils/wpp";
import { UpdateOrCreate } from "./mongoose/utils";
import { mailToLateDebts } from "./utils/messager";
import { updateDebtValueByLateFee } from "./utils/debtDbCalcs";

const DAILY_CRON_SCHEDULE = "0 0 9 * * *"; // Todo dia as (9:00)
const FIVE_SECONDS_CRON_SCHEDULE = "*/5 * * * * *"; // A cada 5 segundos
const MINUTE_CRON_SCHEDULE = "*/60 * * * * *"; // A cada 60 segundos
const HOURLY_CRON_SCHEDULE = "0 * * * *"; // A cada hora

async function main() {
  try {
    cron.schedule(DAILY_CRON_SCHEDULE, async () => {
      const allDebts = await DebtModel.find();
      const lateDebts = allDebts.filter(debt => {
        const currentDueDate = debt.due_dates[debt.callings];

        if (currentDueDate.getTime() < Date.now()) return true;
      });

      await updateDebtValueByLateFee(lateDebts);

      
    });
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
