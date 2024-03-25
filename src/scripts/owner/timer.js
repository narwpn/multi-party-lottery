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

let t1;
let t2;
let t3;

lotteryContract.events
  .T1Changed({ filter: {}, fromBlock: "latest" })
  .on("data", (event) => {
    t1 = event.returnValues.t1;
  });

lotteryContract.events
  .T2Changed({ filter: {}, fromBlock: "latest" })
  .on("data", (event) => {
    t2 = event.returnValues.t2;
  });

lotteryContract.events
  .T3Changed({ filter: {}, fromBlock: "latest" })
  .on("data", (event) => {
    t3 = event.returnValues.t3;
  });

let currentTimeout;

lotteryContract.events
  .StageChanged({ filter: {}, fromBlock: "latest" })
  .on("data", (event) => {
    const stage = event.returnValues.stage;
    switch (stage) {
      case 0:
        console.log("Stage 0: Waiting for the first player's commit");
        break;
      case 1:
        console.log("Stage 1: Waiting for other players' commits");
        currentTimeout = setTimeout(() => endStage(1), t1 * 1000);
        break;
      case 2:
        console.log("Stage 2: Waiting for players to reveal their numbers");
        currentTimeout = setTimeout(() => endStage(2), t2 * 1000);
        break;
      case 3:
        console.log(
          "Stage 3: Waiting for the owner to trigger winner determination"
        );
        currentTimeout = setTimeout(() => endStage(3), t3 * 1000);
        break;
      case 4:
        console.log(
          "Stage 4: Owner didn't trigger winner determination, players can withdraw their funds now"
        );
    }
  });

lotteryContract.events.OwnerTriggeredWinnerDetermination().on("data", () => {
  console.log("Owner triggered winner determination, canceling t3 timeout");
  clearTimeout(currentTimeout);
});

function endStage(stage) {
  lotteryContract.methods.endStage(stage).send({ from: account.address });
}

while (true) {}
