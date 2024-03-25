// For simplicity we use `web3` package here. However, if you are concerned with the size,
//	you may import individual packages like 'web3-eth', 'web3-eth-contract' and 'web3-providers-http'.
const Web3 = require("web3").Web3;
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const web3 = new Web3("https://rpc.sepolia.org");

const bytecodePath = path.join(
  __dirname,
  "../../contracts/LotteryBytecode.bin"
);
const bytecode = fs.readFileSync(bytecodePath, "utf8");

const abi = require("../../contracts/LotteryAbi.json");
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
    arguments: [120, 120, 120, 5, web3.utils.toWei("0.001", "ether")],
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

    const deployedAddressPath = path.join(__dirname, "MyContractAddress.bin");
    fs.writeFileSync(deployedAddressPath, tx.options.address);
  } catch (error) {
    console.error(error);
  }
}

deploy();
