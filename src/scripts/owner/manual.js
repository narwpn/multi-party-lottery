require("dotenv").config();
const OwnerLotteryContract = require("./OwnerLotteryContract");

const HTTPS_RPC_ENDPOINT = process.env.HTTPS_RPC_ENDPOINT;
const LOTTERY_CONTRACT_ADDRESS = process.env.LOTTERY_CONTRACT_ADDRESS;
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;

const abi = require("../../../build/LotteryAbi.json");

const ops = {
  CHANGE_OWNER: "changeOwner",
  UPDATE_PARAMS: "updateParams",
  NEXT_STAGE: "nextStage",
  DETERMINE_WINNER: "determineWinner",
  MANUAL_RESET: "manualReset",
};

async function main() {
  const op = process.argv[2];
  if (!Object.values(ops).includes(op)) {
    console.error("Invalid operation");
    process.exit(1);
  }

  if (op == ops.CHANGE_OWNER) {
    const newOwnerAddress = process.argv[3];
    if (!newOwnerAddress) {
      console.error("New owner address is required");
      process.exit(1);
    }
  }

  if (op == ops.UPDATE_PARAMS) {
    const t1 = process.argv[3];
    const t2 = process.argv[4];
    const t3 = process.argv[5];
    const n = process.argv[6];
    const betAmount = process.argv[7];

    if (!t1 || !t2 || !t3 || !n || !betAmount) {
      console.error("t1, t2, t3, n, and bet amount are required");
      process.exit(1);
    }
  }

  const contract = new OwnerLotteryContract(
    HTTPS_RPC_ENDPOINT,
    LOTTERY_CONTRACT_ADDRESS,
    abi,
    OWNER_PRIVATE_KEY
  );

  switch (op) {
    case ops.CHANGE_OWNER:
      const newOwnerAddress = process.argv[3];
      await contract.changeOwner(newOwnerAddress);
      break;
    case ops.UPDATE_PARAMS:
      const t1 = process.argv[3];
      const t2 = process.argv[4];
      const t3 = process.argv[5];
      const n = process.argv[6];
      const betAmount = process.argv[7];
      await contract.updateParams(t1, t2, t3, n, betAmount);
      break;
    case ops.NEXT_STAGE:
      await contract.nextStage();
      break;
    case ops.DETERMINE_WINNER:
      await contract.determineWinner();
      break;
    case ops.MANUAL_RESET:
      await contract.manualReset();
      break;
  }
}

main();
