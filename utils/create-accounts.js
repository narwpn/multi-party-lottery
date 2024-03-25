const { Web3 } = require("web3");
const fs = require("fs");

const web3 = new Web3("https://rpc.sepolia.org");

const accounts = [];

for (let i = 0; i < 10; i++) {
  let account = web3.eth.accounts.create();
  accounts.push(account);
}

fs.writeFileSync(
  "accounts.json",
  JSON.stringify(accounts, ["address", "privateKey"], 2)
);
