const LotteryContract = require("../LotteryContract");

class PlayerLotteryContract extends LotteryContract {
  constructor(rpcEndpoint, contractAddress, contractAbi, playerPrivateKey) {
    super(rpcEndpoint, contractAddress, contractAbi, playerPrivateKey);
  }
}

module.exports = PlayerLotteryContract;
