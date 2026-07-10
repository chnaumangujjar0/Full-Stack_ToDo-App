import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
 export const connectDb = async () => {
    try {
        const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log("Mongo db connected",connectionInstance.connection.host)
    } catch (error) {
        console.log("Mongo DB Error : ",error)
        process.exit(1);
    }
}

