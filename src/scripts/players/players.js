require("dotenv").config();
const PlayerLotteryContract = require("./PlayerLotteryContract");

const WSS_RPC_ENDPOINT = process.env.WSS_RPC_ENDPOINT;
const LOTTERY_CONTRACT_ADDRESS = process.env.LOTTERY_CONTRACT_ADDRESS;
const PLAYER1_PRIVATE_KEY = process.env.PLAYER1_PRIVATE_KEY;
const PLAYER2_PRIVATE_KEY = process.env.PLAYER2_PRIVATE_KEY;
const PLAYER3_PRIVATE_KEY = process.env.PLAYER3_PRIVATE_KEY;
const PLAYER4_PRIVATE_KEY = process.env.PLAYER4_PRIVATE_KEY;
const PLAYER5_PRIVATE_KEY = process.env.PLAYER5_PRIVATE_KEY;
const PLAYER6_PRIVATE_KEY = process.env.PLAYER6_PRIVATE_KEY;

const abi = require("../../../build/LotteryAbi.json");

async function main() {
  const contract = new PlayerLotteryContract(
    WSS_RPC_ENDPOINT,
    LOTTERY_CONTRACT_ADDRESS,
    abi,
    PLAYER1_PRIVATE_KEY
  );

  const playersPrivateKey = [
    PLAYER1_PRIVATE_KEY,
    PLAYER2_PRIVATE_KEY,
    PLAYER3_PRIVATE_KEY,
    PLAYER4_PRIVATE_KEY,
    PLAYER5_PRIVATE_KEY,
    PLAYER6_PRIVATE_KEY,
  ];

  const nums = [];
  for (let i = 0; i < playersPrivateKey.length; i++) {
    nums.push(Math.floor(Math.random() * 1000));
  }

  async function commit() {
    for (let i = 0; i < playersPrivateKey.length; i++) {
      contract.changeAccount(playersPrivateKey[i]);
      const playerNum = i + 1;
      await contract.commit(nums[i], `salt${playerNum}`);
      console.log(`Player ${playerNum} committed:`);
      console.log(`  Number: ${nums[i]}`);
      console.log(`  Salt: salt${playerNum}`);
    }
  }

  async function reveal() {
    for (let i = 0; i < playersPrivateKey.length-2; i++) {
      contract.changeAccount(playersPrivateKey[i]);
      const playerNum = i + 1;
      await contract.reveal(nums[i], `salt${playerNum}`);
      console.log(`Player ${playerNum} revealed:`);
      console.log(`  Number: ${nums[i]}`);
      console.log(`  Salt: salt${playerNum}`);
    }
  }

  console.log("Committing for all players...");
  await commit();
  console.log("All players committed, waiting for stage 2...");

  contract.subscribeStageChanged(async (stage) => {
    console.log(`Stage changed to ${stage}`);
    if (stage === 2n) {
      console.log("Revealing for all players...");
      await reveal();
      console.log("All players revealed, waiting for stage 3...");
    }
  });
  contract.subscribeOwnerTriggeredWinnerDetermination(() => {
    console.log("Owner triggered winner determination");
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
