# Multi-Party Lottery Ethereum Smart Contract

This project implements a multi-party lottery using Ethereum smart contracts. Participants can join the lottery by sending Ether to the contract, and the winner is randomly selected when the lottery ends.

## Features

- Participants can join the lottery by sending Ether to the contract.
- The contract ensures fairness and randomness in selecting the winner.
- The winner receives the prize pool after the lottery ends.

## Getting Started

### Prerequisites

- Node.js and pnpm installed

### Installation

1. Clone the repository:

   ```shell
   git clone https://github.com/narwpn/multi-party-lottery.git
   ```

2. Install the dependencies:

   ```shell
   cd multi-party-lottery
   pnpm install
   ```

### Usage

1. Create .env file in the top level project directory:

   ```shell
   cp .env.example .env
   ```

2. Create test accounts:

   ```shell
   ./utils/createAccounts.js
   ```

   A file named `.accounts.env` will be created in the top level project directory. Copy its content into accounts section of the `.env` file.

3. Compile and deploy the smart contracts to Ethereum Sepolia test network:

   ```shell
   ./utils/compileAndDeploy.ps1
   ```

   IMPORTANT: Take note of the deployed contract address in the command output. Copy it to the `LOTTERY_CONTRACT_ADDRESS` key in the `.env` file.

4. Run the owner script:

   ```shell
   node ./src/scripts/owner/owner.js
   ```

5. Run the players script:

   ```shell
   node ./src/scripts/players/players.js
   ```

### About Lottery.sol

This Solidity contract represents a multi-stage lottery system designed for the Ethereum blockchain.

##### Flow of Operation

The lottery operates in a cyclical fashion across five distinct stages:

1.  Initialization: The owner deploys the contract, setting initial parameters like stage durations, the maximum number of players, and the bet amount.
2.  Commit Stage (Stage 0/1): Players submit their participation by:
    - Sending the required bet amount in Ether.
    - Providing a hashed value (commit) representing a chosen number and secret salt.
3.  Reveal Stage (Stage 2): Players reveal their actual numbers and the accompanying salt. The contract verifies if the revealed values match the submitted hash.
4.  Winner Determination Stage (Stage 3): The contract identifies eligible players (those who revealed valid numbers within a specified range). XOR and modulo operations are used to determine the winner.
5.  Reset Stage (Stage 4): The contract resets in preparation for the next lottery round.

Important Note: The contract relies on the owner to manually transition between stages using the `nextStage()` function. This implies the need for the owner to operate a separate node to track time durations for each stage.

#### Variables

- `owner`: The address of the contract's owner.
- `t1`, `t2`, `t3`: Durations of the commit, reveal, and winner determination stages, respectively.
- `n`: Maximum number of players allowed.
- `betAmount`: Required bet amount in wei.
- `currentStage`: Track the current stage (0-4).
- `isPlayer`: Tracks if an address has participated.
- `playerIndex`: Maps player addresses to their index in the players array.
- `players`: An array storing player information (address, commit hash, revealed status, chosen number).
- `eligiblePlayersIndex`: Stores indices of eligible players.
- `ownerTriggeredWinnerDetermination`: Indicates if the owner has triggered the determination process.
- `thereIsWinner`: Signals if a winner exists for the round.
- `winner`: The address of the winner.
- `withdrawableAmount`: Tracks the amount a player can withdraw in case the owner fails to determine a winner in time (represents the player's bet amount).

#### Events

- `T1Changed`, `T2Changed`, `T3Changed`, `NChanged`, `BetAmountChanged`: Signal updates to their respective parameters.
- `StageChanged`: Indicates a transition to a new stage.
- `PlayerCommitted`: Confirms a player's commitment.
- `PlayerRevealed`: Confirms a player's reveal.
- `OwnerTriggeredWinnerDetermination`: Signifies owner's initiation of winner determination.
- `Winner`: Announces the winner's address and number.
- `NoEligiblePlayers`: Indicates no valid players in a round.
- `NoWinnerDetermination`: Occurs if winner determination is not triggered within stage 3.

#### Functions

- `constructor`: Initializes the contract with initial parameters.
- `changeOwner`: Transfers ownership.
- `updateParams`: Allows owner to modify stage durations, player limit, and bet amount.
- `nextStage`: Owner-controlled function to progress the lottery through stages.
- `listPlayers`: Offers a public view of players.
- `listEligiblePlayersIndex`: Provides a list of eligible player indices.
- `commit`: For submitting a player's participation and hashed value.
- `reveal`: For players to reveal their numbers and salt.
- `determineWinner`: Logic for calculating the winner (can be triggered by owner).
- `reset`: Resets the contract for a new round.
- `handleWinnerDeterminationTimeout`: Handles a timeout scenario for winner determination (in this case, all players can withdraw their bets using the `withdraw` function).
- `manualReset`: Allows the owner to reset the lottery after failing to determine the winner withing stage 3.
- `withdraw`: Enables participants to withdraw their bet amount in case the owner fails to determine a winner in time.
