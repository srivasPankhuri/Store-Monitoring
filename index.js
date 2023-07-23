const express = require("express");
const app = express();
const csvReader = require("./services/csvReader");

csvReader.storeCSVData();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is up and running`);
});
