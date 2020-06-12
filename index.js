const express = require('express');
const app = express();
const fs = require("fs").promises;
const winston = require("winston");
const accountsRouter = require("./routes/accounts");

global.fileName = "accounts.json";

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: "silly",
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: "myBank.log" })
  ],
  format: combine(
    label({ label: "myBank" }),
    timestamp(),
    myFormat
  )
})

app.use(express.json());
app.use("/account", accountsRouter);

app.listen(3000, async () => {
  try {
    await fs.readFile(fileName, "utf8");
    logger.info("API Started");
  } catch (err) {
    const initialJson = {
      nextId: 1,
      accounts: []
    };
    fs.writeFile(fileName, JSON.stringify(initialJson)).catch(err => {
      logger.error(err);
    });
  }
});