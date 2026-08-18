import cron from "node-cron";
import { Todo } from "../models/todo.model.js"; // Adjust path to your model

export const startCronJobs = () => {
  // Runs at 00:00 (midnight) every single day
  cron.schedule("32 22 * * *", async () => {
    try {
      console.log("Running scheduled task: Cleaning up old completed ToDos");
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      
    } catch (error) {
      console.error("Error in cleanup cron job:", error);
    }
  });
};