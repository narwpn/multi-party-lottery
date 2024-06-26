# Run the solcjs command
npx solcjs "$PSScriptRoot\..\src\contracts\Lottery.sol" --abi --bin

# Rename the files
Rename-Item -Path ".\src_contracts_Lottery_sol_Lottery.abi" -NewName "LotteryAbi.json"
Rename-Item -Path ".\src_contracts_Lottery_sol_Lottery.bin" -NewName "LotteryBytecode.bin"

# Create the build directory if it doesn't exist
if (-not (Test-Path "$PSScriptRoot\..\build")) {
    New-Item -ItemType Directory -Path "$PSScriptRoot\..\build"
}

# Move the renamed files to the build directory
Move-Item -Path ".\LotteryAbi.json" -Destination "$PSScriptRoot\..\build" -Force
Move-Item -Path ".\LotteryBytecode.bin" -Destination "$PSScriptRoot\..\build" -Force