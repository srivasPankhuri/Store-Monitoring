const fs = require("fs");
const csvParser = require("csv-parser");
const Store = require("../models/storeSchema");
const BusinessHours = require("../models/businessHoursSchema");
const Timezone = require("../models/timezoneSchema");

//Function to read and parse csv file
async function storeCSVData() {
  try {
    const storeStatus = [];
    fs.createReadStream("data/store-status.csv")
      .pipe(csvParser())
      .on("data", (row) => {
        storeStatus.push(row);
      })
      .on("end", async () => {
        await Store.insertMany(storeStatus);
        console.log("Store data ingested and stored in the database.");
      });

    const businessHours = [];
    fs.createReadStream("data/Menu-hours.csv")
      .pipe(csvParser())
      .on("data", (row) => {
        businessHours.push(row);
      })
      .on("end", async () => {
        await BusinessHours.insertMany(businessHours);
        console.log("Business hours data ingested and stored in the database.");
      });

    const timezones = [];
    fs.createReadStream("data/Time-zones.csv")
      .pipe(csvParser())
      .on("data", (row) => {
        timezones.push(row);
      })
      .on("end", async () => {
        await Timezone.insertMany(timezones);
        console.log("Timezone data ingested and stored in the database.");
      });
  } catch (error) {
    console.error("Error ingesting CSV data:", error);
  }
}

module.exports = { storeCSVData };
