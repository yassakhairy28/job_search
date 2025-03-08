import express from "express";
import bootstrap from "./src/app.controller.js";
import "./src/modules/auth.module/cron jobs/cronJobs.service.js";
import { runSocket } from "./src/modules/Socket.io/index.js";
const app = express();
const port = process.env.PORT;

await bootstrap(express, app);
const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

runSocket(server);
