const { Web3 } = require("web3");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const HTTPS_RPC_ENDPOINT = process.env.HTTPS_RPC_ENDPOINT;
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;

const web3 = new Web3(HTTPS_RPC_ENDPOINT);

const bytecodePath = path.join(__dirname, "../../../build/LotteryBytecode.bin");
const bytecode = fs.readFileSync(bytecodePath, "utf8");

const abi = require("../../../build/LotteryAbi.json");
const contract = new web3.eth.Contract(abi);
contract.handleRevert = true;

const account = web3.eth.accounts.privateKeyToAccount(OWNER_PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

async function deploy() {
  console.log("deployer account:", account.address);

  const contractDeployer = contract.deploy({
    data: "0x" + bytecode,
    arguments: [60, 60, 60, 4, web3.utils.toWei("0.000001", "ether")],
  });

  const gas = await contractDeployer.estimateGas({
    from: account.address,
  });
  console.log("estimated gas:", gas);

  try {
    const tx = await contractDeployer.send({
      from: account.address,
      gas: gas,
    });
    console.log("Contract deployed at address: " + tx.options.address);
  } catch (error) {
    console.error(error);
  }
}

deploy();
