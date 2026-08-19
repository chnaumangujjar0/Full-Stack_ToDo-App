import cron from "node-cron";
import { Todo } from "../models/todo.model.js";
import { Notification } from "../models/notification.model.js";

export const startCronJobs = () => {
  // Still runs every 5 minutes to check
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      const upcomingTodos = await Todo.find({
        status: { $ne: "completed" },
        reminderSent: false, // Must be false
        deadline: {
          $gt: now,             
          $lte: twoHoursFromNow 
        }
      }).populate("owner");

      if (upcomingTodos.length === 0) return;

      const newNotifications = [];
      const todoIdsToUpdate = []; 

      upcomingTodos.forEach((todo) => {
        if (!todo.owner) return;

        newNotifications.push({
          user: todo.owner._id,
          message: `Urgent: Your task "${todo.title}" is due in less than 2 hours!`,
          type: "deadline_warning",
          isRead: false
        });

        todoIdsToUpdate.push(todo._id);
      });

      await Notification.insertMany(newNotifications);
      
      await Todo.updateMany(
        { _id: { $in: todoIdsToUpdate } },
        { $set: { reminderSent: true } }
      );

      console.log(`Generated ${newNotifications.length} deadline warnings and updated task flags.`);

    } catch (error) {
      console.error("Error in deadline cron job:", error);
    }
  });
};