const Web3 = require("web3").Web3;
const dotenv = require("dotenv");
dotenv.config();

const web3 = new Web3("https://rpc.sepolia.org");

const account = web3.eth.accounts.privateKeyToAccount(
  process.env.OWNER_PRIVATE_KEY
);
web3.eth.accounts.wallet.add(account);

const lotteryContractAddress = process.env.LOTTERY_CONTRACT_ADDRESS;
const lotteryContractABI = require("../../contracts/LotteryAbi.json");
const lotteryContract = new web3.eth.Contract(
  lotteryContractABI,
  lotteryContractAddress
);

const t1 = 60;
const t2 = 60;
const t3 = 60;
const n = 4;
const betAmount = web3.utils.toWei("0.001", "ether");

lotteryContract.methods
  .updateParams(t1, t2, t3, n, betAmount)
  .estimateGas({ from: account.address })
  .then((gas) => {
    return lotteryContract.methods
      .updateParams(t1, t2, t3, n, betAmount)
      .send({ from: account.address, gas: gas });
  })
  .then((receipt) => {
    console.log(receipt);
  });
