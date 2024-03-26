const { Web3 } = require("web3");

class LotteryContract {
  constructor(rpcEndpoint, contractAddress, contractAbi) {
    this.web3 = new Web3(rpcEndpoint);

    this.contract = new this.web3.eth.Contract(contractAbi, contractAddress);
    this.contract.handleRevert = true;
  }

  getOwner() {
    return this.contract.methods.owner().call();
  }

  getT1() {
    return this.contract.methods.t1().call();
  }

  getT2() {
    return this.contract.methods.t2().call();
  }

  getT3() {
    return this.contract.methods.t3().call();
  }

  getN() {
    return this.contract.methods.n().call();
  }

  getBetAmount() {
    return this.contract.methods.betAmount().call();
  }

  getCurrentStage() {
    return this.contract.methods.currentStage().call();
  }

  getIsPlayer(address) {
    return this.contract.methods.isPlayer(address).call();
  }

  getPlayerIndex(address) {
    return this.contract.methods.playerIndex(address).call();
  }

  listPlayers() {
    return this.contract.methods.listPlayers().call();
  }

  getPlayer(index) {
    return this.contract.methods.players(index).call();
  }

  listEligiblePlayersIndex() {
    return this.contract.methods.listEligiblePlayersIndex().call();
  }

  getEligiblePlayerIndex(index) {
    return this.contract.methods.eligiblePlayersIndex(index).call();
  }

  getOwnerTriggeredWinnerDetermination() {
    return this.contract.methods.ownerTriggeredWinnerDetermination().call();
  }

  getThereIsWinner() {
    return this.contract.methods.thereIsWinner().call();
  }

  getWinner() {
    return this.contract.methods.winner().call();
  }

  getWithrawableAmount(address) {
    return this.contract.methods.withrawableAmount(address).call();
  }

  commit(num, salt) {
    if (num < 0 || num > 999) {
      throw new Error("Invalid number");
    }
    const hash = this.web3.utils.sha3(
      this.web3.eth.abi.encodeParameters(["uint", "string"], [num, salt])
    );
    return this.contract.methods.commit(hash).send({
      value: this.web3.utils.toWei("0.001", "ether"),
    });
  }

  reveal(num, salt) {
    return this.contract.methods.reveal(num, salt).send();
  }

  withdraw() {
    return this.contract.methods.withdraw().send();
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
