const LotteryContract = require("../LotteryContract");

class OwnerLotteryContract extends LotteryContract {
  constructor(rpcEndpoint, contractAddress, contractAbi, ownerPrivateKey) {
    super(rpcEndpoint, contractAddress, contractAbi, ownerPrivateKey);
  }

  changeOwner(newOwnerAddress) {
    return this.contract.methods
      .changeOwner(newOwnerAddress)
      .send({ from: this.account.address });
  }

  updateParams(t1, t2, t3, n, betAmount) {
    return this.contract.methods
      .updateParams(t1, t2, t3, n, betAmount)
      .send({ from: this.account.address });
  }

  nextStage() {
    return this.contract.methods
      .nextStage()
      .send({ from: this.account.address });
  }

  determineWinner() {
    return this.contract.methods
      .determineWinner()
      .send({ from: this.account.address });
  }

  manualReset() {
    return this.contract.methods
      .manualReset()
      .send({ from: this.account.address });
  }
}

module.exports = OwnerLotteryContract;
