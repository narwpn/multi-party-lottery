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

  async function commit() {
    for (let i = 0; i < playersPrivateKey.length; i++) {
      contract.changeAccount(playersPrivateKey[i]);
      const playerNum = i + 1;
      await contract.commit(playerNum, `salt${playerNum}`);
      console.log(`Player ${playerNum} committed`);
    }
  }

  async function reveal() {
    for (let i = 0; i < playersPrivateKey.length; i++) {
      contract.changeAccount(playersPrivateKey[i]);
      const playerNum = i + 1;
      await contract.reveal(playerNum, `salt${playerNum}`);
      console.log(`Player ${playerNum} revealed`);
    }
  }

  await commit();

  contract.subscribeStageChanged((stage) => {
    console.log(`Stage changed to ${stage}`);
    if (stage === 2) {
      reveal();
    }
  });
}

main();
