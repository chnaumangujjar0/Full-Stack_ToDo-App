import cron from "node-cron";
import { Todo } from "../models/todo.model.js";
import { Notification } from "../models/notification.model.js";
import { LoginActivity } from "../models/loginActivity.model.js";
import { Invite } from "../models/invite.model.js";

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
  cron.schedule("0 0 * * *", async () => {
    console.log("Running scheduled task: Cleaning up old notifications");

    try {
      // Calculate the exact date 30 days ago
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      // Delete all notifications created before that date
      const result = await Notification.deleteMany({
        createdAt: { $lte: fifteenDaysAgo }
      });

      if (result.deletedCount > 0) {
        console.log(`Database Cleanup: Deleted ${result.deletedCount} notifications older than 15 days.`);
      }

    } catch (error) {
      console.error("Error in notification cleanup cron job:", error);
    }
  });
  cron.schedule("0 0 * * *", async () => {
    console.log("Running scheduled task: Cleaning up old activity");

    try {
      // Calculate the exact date 15 days ago
      const fifteenDaysAgo = new Date();
      console.log(fifteenDaysAgo)
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      // Delete all login created before that date
      const result = await LoginActivity.deleteMany({
        createdAt: { $lte: fifteenDaysAgo }
      });

      if (result.deletedCount > 0) {
        console.log(`Database Cleanup: Deleted ${result.deletedCount} notifications older than 15 days.`);
      }

    } catch (error) {
      console.error("Error in Login activity cleanup cron job:", error);
    }
  });
  cron.schedule("34 14 * * *", async () => {
    console.log("Running scheduled task: Cleaning up old activity");

    try {
      // Calculate the exact date 15 days ago
      const fifteenDaysAgo = new Date();
      console.log(fifteenDaysAgo)
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      // Delete all invites created before that date
      const result = await Invite.deleteMany({
        createdAt: { $lte: fifteenDaysAgo },
        status: "accepted"
      });

      if (result.deletedCount > 0) {
        console.log(`Database Cleanup: Deleted ${result.deletedCount} Invites older than 15 days.`);
      }

    } catch (error) {
      console.error("Error in  Invites cleanup cron job:", error);
    }
  });
};