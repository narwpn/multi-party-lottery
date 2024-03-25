const Web3 = require("web3").Web3;
const dotenv = require("dotenv");
dotenv.config();

const web3 = new Web3("https://rpc.sepolia.org");

const account = web3.eth.accounts.privateKeyToAccount(
  process.env.PLAYER1_PRIVATE_KEY
);
web3.eth.accounts.wallet.add(account);

const lotteryContractAddress = process.env.TEST_LOTTERY_CONTRACT_ADDRESS;
const lotteryContractABI = require("../../../build/LotteryAbi.json");
const lotteryContract = new web3.eth.Contract(
  lotteryContractABI,
  lotteryContractAddress
);

async function checkStage() {
  console.log("Checking stage...");
  await lotteryContract.methods
    .currentStage()
    .call()
    .then((stage) => {
      console.log(stage);
    });
}

async function checkBetAmount() {
  console.log("Checking bet amount...");
  await lotteryContract.methods
    .betAmount()
    .call()
    .then((amount) => {
      console.log(amount);
    });
}

async function commit(number, salt) {
  hash = web3.utils.soliditySha3(
    { type: "uint256", value: number },
    { type: "bytes32", value: salt }
  );
  await lotteryContract.methods
    .commit(hash)
    .estimateGas({ from: account.address })
    .then((gas) =>
      lotteryContract.methods.commit(hash).send({
        from: account.address,
        gas: gas,
        value: web3.utils.toWei("0.001", "ether"),
      })
    );
}

async function reveal(number, salt) {
  await lotteryContract.methods
    .reveal(number, web3.utils.toHex(salt))
    .estimateGas({ from: account.address })
    .then((gas) =>
      lotteryContract.methods
        .reveal(number, web3.utils.toHex(salt))
        .send({ from: account.address, gas: gas })
    );
}

async function main() {
  await checkStage();
  await checkBetAmount();
  await commit(5, "salty1");
  await checkStage();
  setTimeout(async () => {
    await reveal(5, "salty1");
    await checkStage();
  }, 70 * 1000);
}

main();
