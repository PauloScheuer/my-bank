const express = require("express");
const router = express.Router();
const fs = require("fs").promises;

router.post("/", async (req, res) => {
  let account = req.body;

  try {
    let data = await fs.readFile(fileName, "utf8");
    let json = JSON.parse(data);

    account = { id: json.nextId++, ...account };
    json.accounts.push(account);

    await fs.writeFile(fileName, JSON.stringify(json));

    res.end();

    logger.info(`POST /account - ${JSON.stringify(account)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`POST /account - ${err.message}`);
  }

});

router.get("/", async (req, res) => {

  try {
    let data = await fs.readFile(fileName, "utf8");
    let results = JSON.parse(data);
    delete results.nextId;
    res.send(results);
    logger.info("GET /account");
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /account - ${err.message}`);
  }
});

router.get("/:id", async (req, res) => {

  try {
    let data = await fs.readFile(fileName, "utf8");
    let results = JSON.parse(data);
    const account = results.accounts.find(account => {
      return account.id == req.params.id;
    });
    res.send(account);
    logger.info(`GET /account:id - ${account}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /account:id - ${err.message}`);
  }

});

router.delete("/:id", async (req, res) => {

  try {
    let data = await fs.readFile(fileName, "utf8");
    let results = JSON.parse(data);
    let accounts = results.accounts.filter(account => {
      return account.id != req.params.id;
    });
    results.accounts = accounts;
    await fs.writeFile(fileName, JSON.stringify(results));
    res.end();
    logger.info(`DELETE /account:id - ${req.params.id}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`DELETE /account:id - ${err.message}`);
  }
});

router.put('/', async (req, res) => {
  try {
    let newAccount = req.body;
    let data = await fs.readFile(fileName, "utf8");
    let results = JSON.parse(data);

    let oldIndex = results.accounts.findIndex(account => {
      return account.id === newAccount.id;
    });

    results.accounts[oldIndex].name = newAccount.name;
    results.accounts[oldIndex].balance = newAccount.balance;

    await fs.writeFile(fileName, JSON.stringify(results));
    res.end();
    logger.info(`PUT /account - ${JSON.stringify(newAccount)}`);

  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`PUT /account - ${err.message}`);
  }
});

router.post("/transaction", async (req, res) => {

  try {
    let newTransaction = req.body;

    let data = await fs.readFile(fileName, "utf8");
    let results = JSON.parse(data);

    let index = results.accounts.findIndex(account => {
      return account.id === newTransaction.id;
    });

    if ((newTransaction.value < 0) && ((results.accounts[index].balance + newTransaction.value) < 0)) {
      throw new Error("Não há valor suficiente")
    }

    results.accounts[index].balance += newTransaction.value;

    await fs.writeFile(fileName, JSON.stringify(results));
    res.send(results.accounts[index]);
    logger.info(`POST /account/transaction - ${JSON.stringify(newTransaction)}}`);

  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`POST /account/transaction - ${err.message}`);
  }
});

module.exports = router;