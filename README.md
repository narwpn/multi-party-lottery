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
