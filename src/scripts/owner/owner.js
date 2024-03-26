require("dotenv").config();
const OwnerLotteryContract = require("./OwnerLotteryContract");

const WSS_RPC_ENDPOINT = process.env.WSS_RPC_ENDPOINT;
const LOTTERY_CONTRACT_ADDRESS = process.env.LOTTERY_CONTRACT_ADDRESS;
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;

const abi = require("../../../build/LotteryAbi.json");

let t1;
let t2;
let t3;

let currentTimeout;

async function main() {
  const contract = new OwnerLotteryContract(
    WSS_RPC_ENDPOINT,
    LOTTERY_CONTRACT_ADDRESS,
    abi,
    OWNER_PRIVATE_KEY
  );

  t1 = await contract.getT1();
  console.log("t1: ", t1);
  t2 = await contract.getT2();
  console.log("t2: ", t2);
  t3 = await contract.getT3();
  console.log("t3: ", t3);

  console.log("Listening for events...");

  subscriptionT1Changed = contract.subscribeT1Changed((_t1) => {
    t1 = _t1;
    console.log("t1 changed: ", _t1);
  });
  subscriptionT2Changed = contract.subscribeT2Changed((_t2) => {
    t2 = _t2;
    console.log("t2 changed: ", _t2);
  });
  subscriptionT3Changed = contract.subscribeT3Changed((_t3) => {
    t3 = _t3;
    console.log("t3 changed: ", _t3);
  });

  subscriptionOwnerTriggeredWinnerDetermination =
    contract.subscribeOwnerTriggeredWinnerDetermination(() => {
      console.log("Owner triggered winner determination, canceling t3 timeout");
      clearTimeout(currentTimeout);
    });

  subscriptionStageChanged = contract.subscribeStageChanged((stage) => {
    console.log("Stage changed: ", stage);
    switch (stage) {
      case 0n:
        console.lot("Stage 0: Waiting for the first player to commit");
        break;
      case 1n:
        console.log("Stage 1: Waiting for other players to commit");
        currentTimeout = setTimeout(() => {
          contract.nextStage();
        }, Number(t1) * 1000);
        break;
      case 2n:
        console.log("Stage 2: Waiting for players to reveal");
        currentTimeout = setTimeout(() => {
          contract.nextStage();
        }, Number(t2) * 1000);
        break;
      case 3n:
        console.log("Stage 3: Waiting for the owner to determine the winner");
        currentTimeout = setTimeout(() => {
          contract.nextStage();
        }, Number(t3) * 1000);
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
}

main();
