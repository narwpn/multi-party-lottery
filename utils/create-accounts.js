const { Web3 } = require("web3");
const fs = require("fs");

const HTTPS_RPC_ENDPOINT = process.env.HTTPS_RPC_ENDPOINT;

const web3 = new Web3(HTTPS_RPC_ENDPOINT);

for (let i = 0; i < 7; i++) {
  let account = web3.eth.accounts.create();
  if (i === 0) {
    fs.writeFileSync(
      ".accounts.env",
      `OWNER_ADDRESS="${account.address}"\nOWNER_PRIVATE_KEY="${account.privateKey}"\n`
    );
  } else {
    fs.appendFileSync(
      ".accounts.env",
      `\nPLAYER${i}_ADDRESS="${account.address}"\nPLAYER${i}_PRIVATE_KEY="${account.privateKey}"\n`
    );
  }
}
