const moment = require("moment-timezone");
const Store = require("../models/storeSchema");
const BusinessHours = require("../models/businessHoursSchema");
const Timezone = require("../models/timezoneSchema");

// Function to interpolate and extrapolate observations based on business hours and timezone
async function interpolateBusinessHours(store_id, currentTimestamp) {
  try {
    const store = await Store.findOne({ store_id });

    if (!store) {
      throw new Error("Store not found.");
    }

    const businessHours = await BusinessHours.find({ store_id });

    const timezoneData = await Timezone.findOne({ store_id });

    const timezone = timezoneData
      ? timezoneData.timezone_str
      : "America/Chicago";

    // Get the current day of the week in the store's timezone
    const currentDayOfWeek = moment(currentTimestamp).tz(timezone).day();

    // Find the relevant business hours for the current day
    const relevantHours = businessHours.find(
      (hour) => hour.dayOfWeek === currentDayOfWeek
    );

    if (!relevantHours) {
      // If data is missing for the current day, assume the store is open 24*7
      return { uptime: 60, downtime: 0 }; // Assuming 60 minutes for uptime and 0 minutes for downtime
    }

    const startTime = moment.tz(
      relevantHours.start_time_local,
      "HH:mm",
      timezone
    );
    const endTime = moment.tz(relevantHours.end_time_local, "HH:mm", timezone);

    const businessHoursDuration = moment.duration(endTime.diff(startTime));

    const elapsedTime = moment.duration(currentTimestamp.diff(startTime));

    const percentageElapsed =
      elapsedTime.asMinutes() / businessHoursDuration.asMinutes();

    // Extrapolate uptime and downtime based on the percentage elapsed
    const totalUptime =
      store.status === "active"
        ? percentageElapsed * businessHoursDuration.asMinutes()
        : 0;
    const totalDowntime =
      store.status === "inactive"
        ? percentageElapsed * businessHoursDuration.asMinutes()
        : 0;

    return { uptime: totalUptime, downtime: totalDowntime };
  } catch (error) {
    console.error("Error interpolating business hours:", error);
    return { uptime: 0, downtime: 0 };
  }
}

module.exports = { interpolateBusinessHours };
