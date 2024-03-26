const Web3 = require("web3").Web3;
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const web3 = new Web3("https://sepolia.drpc.org");

const bytecodePath = path.join(__dirname, "../../../build/LotteryBytecode.bin");
const bytecode = fs.readFileSync(bytecodePath, "utf8");

const abi = require("../../../build/LotteryAbi.json");
const myContract = new web3.eth.Contract(abi);
myContract.handleRevert = true;

const account = web3.eth.accounts.privateKeyToAccount(
  process.env.OWNER_PRIVATE_KEY
);
web3.eth.accounts.wallet.add(account);

async function deploy() {
  console.log("deployer account:", account.address);

  const contractDeployer = myContract.deploy({
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
