const {Web3} = require('web3');

class LotteryContract {
  constructor(wssRpcEndpoint, contractAddress, contractAbi, ownerPrivateKey) {
    this.web3 = new Web3(wssRpcEndpoint);

    this.contract = new this.web3.eth.Contract(contractAbi, contractAddress);
    this.contract.handleRevert = true;

    this.account = this.web3.eth.accounts.privateKeyToAccount(ownerPrivateKey);
    this.web3.eth.accounts.wallet.add(this.account);
  }

  async changeOwner(newOwnerAddress) {
    await this.contract.methods
      .changeOwner(newOwnerAddress)
      .estimateGas({ from: this.account.address })
      .then((gas) => {
        this.contract.methods
          .changeOwner(newOwnerAddress)
          .send({ from: this.account.address, gas: gas });
      });
  }

  async updateParams(t1, t2, t3, n, betAmount) {
    await this.contract.methods
      .updateParams(t1, t2, t3, n, betAmount)
      .estimateGas({ from: this.account.address })
      .then((gas) =>
        this.contract.methods
          .updateParams(t1, t2, t3, n, betAmount)
          .send({ from: this.account.address, gas: gas })
      );
  }

  async nextStage() {
    await this.contract.methods
      .nextStage()
      .estimateGas({ from: this.account.address })
      .then((gas) =>
        this.contract.methods
          .nextStage()
          .send({ from: this.account.address, gas: gas })
      );
  }

  async determineWinner() {
    await this.contract.methods
      .determineWinner()
      .estimateGas({ from: this.account.address })
      .then((gas) =>
        this.contract.methods
          .determineWinner()
          .send({ from: this.account.address, gas: gas })
      );
  }

  async manualReset() {
    await this.contract.methods
      .manualReset()
      .estimateGas({ from: this.account.address })
      .then((gas) =>
        this.contract.methods
          .manualReset()
          .send({ from: this.account.address, gas: gas })
      );
  }
}

module.exports = LotteryContract;
