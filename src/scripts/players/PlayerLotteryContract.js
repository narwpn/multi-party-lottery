const LotteryContract = require("../LotteryContract");

class PlayerLotteryContract extends LotteryContract {
  constructor(wssRpcEndpoint, contractAddress, contractAbi, playerPrivateKey) {
    super(wssRpcEndpoint, contractAddress, contractAbi);

    this.account = this.web3.eth.accounts.privateKeyToAccount(playerPrivateKey);
    this.web3.eth.accounts.wallet.add(this.account);
  }
}

module.exports = PlayerLotteryContract;
