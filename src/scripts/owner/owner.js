require("dotenv").config();
const OwnerLotteryContract = require("./OwnerLotteryContract");

const WSS_RPC_ENDPOINT = process.env.WSS_RPC_ENDPOINT;
const LOTTERY_CONTRACT_ADDRESS = process.env.LOTTERY_CONTRACT_ADDRESS;
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;

const abi = require("../../../build/LotteryAbi.json");

async function main() {
  const contract = new OwnerLotteryContract(
    WSS_RPC_ENDPOINT,
    LOTTERY_CONTRACT_ADDRESS,
    abi,
    OWNER_PRIVATE_KEY
  );

  let t1;
  let t2;
  let t3;

  let currentTimeout;

  t1 = await contract.getT1();
  console.log("t1: ", t1);
  t2 = await contract.getT2();
  console.log("t2: ", t2);
  t3 = await contract.getT3();
  console.log("t3: ", t3);

  console.log("Current stage: ", await contract.getCurrentStage());

  console.log("Listening for events...");

  contract.subscribeT1Changed((_t1) => {
    t1 = _t1;
    console.log("t1 changed: ", _t1);
  });
  contract.subscribeT2Changed((_t2) => {
    t2 = _t2;
    console.log("t2 changed: ", _t2);
  });
  contract.subscribeT3Changed((_t3) => {
    t3 = _t3;
    console.log("t3 changed: ", _t3);
  });
  contract.subscribeNChanged((n) => {
    console.log("n changed: ", n);
  });
  contract.subscribeBetAmountChanged((betAmount) => {
    console.log("betAmount changed: ", betAmount);
  });
  contract.subscribeStageChanged((stage) => {
    console.log("Stage changed: ", stage);
    switch (stage) {
      case 0n:
        console.lot("Stage 0: Waiting for the first player to commit");
        break;
      case 1n:
        currentTimeout = setTimeout(() => {
          contract.nextStage();
          console.log("Stage 1: Timeout, moving to stage 2");
        }, Number(t1) * 1000);
        console.log("Stage 1: Waiting for other players to commit");
        break;
      case 2n:
        currentTimeout = setTimeout(() => {
          contract.nextStage();
          console.log("Stage 2: Timeout, moving to stage 3");
        }, Number(t2) * 1000);
        console.log("Stage 2: Waiting for players to reveal");
        break;
      case 3n:
        currentTimeout = setTimeout(() => {
          contract.nextStage();
          console.log("Stage 3: Timeout, moving to stage 4");
        }, Number(t3) * 1000);
        console.log("Stage 3: Waiting for the owner to determine the winner");
        break;
      case 4n:
        console.log("Stage 4: The owner did not determine the winner in time");
        console.log("Players can withdraw their funds from now on");
        console.log("The owner must manually restart the lottery");
        break;
      default:
        console.error("Unknown stage: ", stage);
    }
  });
  contract.subscribePlayerCommitted((addr, commit) => {
    console.log("Player committed:");
    console.log("  Address: ", addr);
    console.log("  Commit: ", commit);
  });
  contract.subscribePlayerRevealed((addr, commit, num, salt) => {
    console.log("Player revealed:");
    console.log("  Address: ", addr);
    console.log("  Commit: ", commit);
    console.log("  Number: ", num);
    console.log("  Salt: ", salt);
  });
  contract.subscribeOwnerTriggeredWinnerDetermination(() => {
    clearTimeout(currentTimeout);
    console.log("Owner triggered winner determination, canceling t3 timeout");
  });
  contract.subscribeWinner((addr, num) => {
    console.log("Winner:");
    console.log("  Address: ", addr);
    console.log("  Number: ", num);
  });
  contract.subscribeNoEligiblePlayers(() => {
    console.log("No eligible players");
  });
  contract.subscribeNoWinnerDetermination(() => {
    console.log("No winner determination");
  });
}

main();
