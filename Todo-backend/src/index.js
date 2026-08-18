import dns from "node:dns";
dns.setDefaultResultOrder('ipv4first');


import dotenv from "dotenv"
dotenv.config()

import {connectDb} from "./db/db.js"
import { app } from "./app.js";
import { startCronJobs } from "./jobs/todoJobs.js";
connectDb()
    .then(() => {
        app.on("error",(err)=>{
            console.log("Error : ",err)
            throw err
        })
        startCronJobs();
        app.listen(process.env.PORT || 8000, () => {
            console.log(
                `Server is Running On Port ${process.env.PORT}`
            );
        });

    })
    .catch(err => console.log(err));