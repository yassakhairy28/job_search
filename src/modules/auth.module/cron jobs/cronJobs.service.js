import cron from "node-cron";
import userModel from "../../../DB/models/user.model.js";
import * as DBservices from "../../../DB/DBservices.js";
import asyncHandler from "../../../utils/error handling/asyncHandler.js";

cron.schedule(" * */6 * * *", async () => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const result = await DBservices.updateOne({
    model: userModel,
    filter: {
      OTP: { $pull: { expiresIn: { $lt: tenMinutesAgo } } },
    },
    data: {
      $pull: { OTP: { expiresIn: { $lt: tenMinutesAgo } } },
    },
  });

  console.log(`Successfully removed OTP from ${result.modifiedCount} users.`);
});
