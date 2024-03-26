const { Web3 } = require("web3");

class LotteryContract {
  constructor(rpcEndpoint, contractAddress, contractAbi, privateKey) {
    this.web3 = new Web3(rpcEndpoint);
    this.contract = new this.web3.eth.Contract(contractAbi, contractAddress);
    this.contract.handleRevert = true;
    this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    this.web3.eth.accounts.wallet.add(this.account);
  }

  changeAccount(privateKey) {
    this.web3.eth.accounts.wallet.clear();
    this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    this.web3.eth.accounts.wallet.add(this.account);
  }

  getOwner() {
    return this.contract.methods.owner().call({ from: this.account.address });
  }

  getT1() {
    return this.contract.methods.t1().call({ from: this.account.address });
  }

  getT2() {
    return this.contract.methods.t2().call({ from: this.account.address });
  }

  getT3() {
    return this.contract.methods.t3().call({ from: this.account.address });
  }

  getN() {
    return this.contract.methods.n().call({ from: this.account.address });
  }

  getBetAmount() {
    return this.contract.methods
      .betAmount()
      .call({ from: this.account.address });
  }

  getCurrentStage() {
    return this.contract.methods
      .currentStage()
      .call({ from: this.account.address });
  }

  getIsPlayer(address) {
    return this.contract.methods
      .isPlayer(address)
      .call({ from: this.account.address });
  }

  getPlayerIndex(address) {
    return this.contract.methods
      .playerIndex(address)
      .call({ from: this.account.address });
  }

  listPlayers() {
    return this.contract.methods
      .listPlayers()
      .call({ from: this.account.address });
  }

  getPlayer(index) {
    return this.contract.methods
      .players(index)
      .call({ from: this.account.address });
  }

  listEligiblePlayersIndex() {
    return this.contract.methods
      .listEligiblePlayersIndex()
      .call({ from: this.account.address });
  }

  getEligiblePlayerIndex(index) {
    return this.contract.methods
      .eligiblePlayersIndex(index)
      .call({ from: this.account.address });
  }

  getOwnerTriggeredWinnerDetermination() {
    return this.contract.methods
      .ownerTriggeredWinnerDetermination()
      .call({ from: this.account.address });
  }

  getThereIsWinner() {
    return this.contract.methods
      .thereIsWinner()
      .call({ from: this.account.address });
  }

  getWinner() {
    return this.contract.methods.winner().call({ from: this.account.address });
  }

  getWithrawableAmount(address) {
    return this.contract.methods
      .withrawableAmount(address)
      .call({ from: this.account.address });
  }

  commit(num, salt) {
    if (num < 0 || num > 999) {
      throw new Error("Invalid number");
    }
    const hash = this.web3.utils.soliditySha3(
      { t: "uint256", v: num },
      { t: "string", v: salt }
    );
    return this.contract.methods.commit(hash).send({
      from: this.account.address,
      value: this.web3.utils.toWei("0.001", "ether"),
    });
  }

  reveal(num, salt) {
    return this.contract.methods
      .reveal(num, salt)
      .send({ from: this.account.address });
  }

  withdraw() {
    return this.contract.methods
      .withdraw()
      .send({ from: this.account.address });
  }

  // event subscriptions require a wss endpoint

  subscribeT1Changed(callback) {
    return this.contract.events.T1Changed().on("data", (event) => {
      const t1 = event.returnValues.t1;
      callback(t1);
    });
  }

  subscribeT2Changed(callback) {
    return this.contract.events.T2Changed().on("data", (event) => {
      const t2 = event.returnValues.t2;
      callback(t2);
    });
  }

  subscribeT3Changed(callback) {
    return this.contract.events.T3Changed().on("data", (event) => {
      const t3 = event.returnValues.t3;
      callback(t3);
    });
  }

  subscribeNChanged(callback) {
    return this.contract.events.NChanged().on("data", (event) => {
      const n = event.returnValues.n;
      callback(n);
    });
  }

  subscribeBetAmountChanged(callback) {
    return this.contract.events.BetAmountChanged().on("data", (event) => {
      const betAmount = event.returnValues.betAmount;
      callback(betAmount);
    });
  }

  subscribeStageChanged(callback) {
    return this.contract.events.StageChanged().on("data", (event) => {
      const stage = event.returnValues.stage;
      callback(stage);
    });
  }

  subscribePlayerCommitted(callback) {
    return this.contract.events.PlayerCommitted().on("data", (event) => {
      const addr = event.returnValues.addr;
      const commit = event.returnValues.commit;
      callback(addr, commit);
    });
  }

  subscribePlayerRevealed(callback) {
    return this.contract.events.PlayerRevealed().on("data", (event) => {
      const addr = event.returnValues.addr;
      const commit = event.returnValues.commit;
      const num = event.returnValues.num;
      const salt = event.returnValues.salt;
      callback(addr, commit, num, salt);
    });
  }

  subscribeOwnerTriggeredWinnerDetermination(callback) {
    return this.contract.events
      .OwnerTriggeredWinnerDetermination()
      .on("data", callback);
  }

  subscribeWinner(callback) {
    return this.contract.events.Winner().on("data", (event) => {
      const addr = event.returnValues.addr;
      const num = event.returnValues.num;
      callback(addr, num);
    });
  }

  subscribeNoEligiblePlayers(callback) {
    return this.contract.events.NoEligiblePlayers().on("data", callback);
  }

  subscribeNoWinnerDetermination(callback) {
    return this.contract.events.NoWinnerDetermination().on("data", callback);
  }
}

module.exports = LotteryContract;
