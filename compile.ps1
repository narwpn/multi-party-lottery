# Run the solcjs command
npx solcjs .\src\contracts\Lottery.sol --abi --bin

# Rename the files
Rename-Item -Path ".\src_contracts_Lottery_sol_Lottery.abi" -NewName "LotteryAbi.json"
Rename-Item -Path ".\src_contracts_Lottery_sol_Lottery.bin" -NewName "LotteryBytecode.bin"

# Move the renamed files to the build directory
Move-Item -Path ".\LotteryAbi.json" -Destination ".\build" -Force
Move-Item -Path ".\LotteryBytecode.bin" -Destination ".\build" -Force