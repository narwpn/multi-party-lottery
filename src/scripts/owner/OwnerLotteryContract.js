const LotteryContract = require("../LotteryContract");

class OwnerLotteryContract extends LotteryContract {
  constructor(wssRpcEndpoint, contractAddress, contractAbi, ownerPrivateKey) {
    super(wssRpcEndpoint, contractAddress, contractAbi);

    this.account = this.web3.eth.accounts.privateKeyToAccount(ownerPrivateKey);
    this.web3.eth.accounts.wallet.add(this.account);
  }

  changeOwner(newOwnerAddress) {
    return this.contract.methods.changeOwner(newOwnerAddress).send();
  }

  updateParams(t1, t2, t3, n, betAmount) {
    return this.contract.methods.updateParams(t1, t2, t3, n, betAmount).send();
  }

  nextStage() {
    return this.contract.methods.nextStage().send();
  }

  determineWinner() {
    return this.contract.methods.determineWinner().send();
  }

  manualReset() {
    return this.contract.methods.manualReset().send();
  }
}

module.exports = OwnerLotteryContract;
