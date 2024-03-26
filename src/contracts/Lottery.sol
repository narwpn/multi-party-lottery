// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract Lottery {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function changeOwner(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    uint public t1; // commit stage duration
    uint public t2; // reveal stage duration
    uint public t3; // determine winner stage duration
    uint public n; // player limit
    uint public betAmount; // in wei

    constructor(uint _t1, uint _t2, uint _t3, uint _n, uint _betAmount) {
        owner = msg.sender;
        t1 = _t1;
        t2 = _t2;
        t3 = _t3;
        n = _n;
        betAmount = _betAmount;
    }

    event T1Changed(uint t1);
    event T2Changed(uint t2);
    event T3Changed(uint t3);
    event NChanged(uint n);
    event BetAmountChanged(uint betAmount);

    function updateParams(
        uint _t1,
        uint _t2,
        uint _t3,
        uint _n,
        uint _betAmount
    ) public onlyOwner {
        require(currentStage == 0, "Invalid stage");
        if (_t1 != t1) {
            t1 = _t1;
            emit T1Changed(t1);
        }
        if (_t2 != t2) {
            t2 = _t2;
            emit T2Changed(t2);
        }
        if (_t3 != t3) {
            t3 = _t3;
            emit T3Changed(t3);
        }
        if (_n != n) {
            n = _n;
            emit NChanged(n);
        }
        if (_betAmount != betAmount) {
            betAmount = _betAmount;
            emit BetAmountChanged(betAmount);
        }
    }

    uint public currentStage = 0;
    event StageChanged(uint stage);

    function nextStage() public onlyOwner {
        // for stage 4, owner must call manualReset
        require(currentStage < 4, "Invalid stage");
        currentStage = (currentStage + 1) % 5;
        emit StageChanged(currentStage);
        if (currentStage == 4) {
            handleWinnerDeterminationTimeout();
        }
    }

    struct Player {
        address addr;
        bytes32 commit;
        bool revealed;
        uint num;
    }

    mapping(address => bool) public isPlayer;
    mapping(address => uint) public playerIndex;
    Player[] public players;
    uint[] public eligiblePlayersIndex;
    bool public ownerTriggeredWinnerDetermination = false;

    event PlayerCommitted(address addr, bytes32 commit);

    function commit(bytes32 _commit) public payable {
        require(currentStage == 0 || currentStage == 1, "Invalid stage");
        require(!isPlayer[msg.sender], "Player already commited");
        require(players.length < n, "Maximum number of players reached");
        require(msg.value == betAmount, "Invalid value");
        isPlayer[msg.sender] = true;
        playerIndex[msg.sender] = players.length;
        players.push(Player(msg.sender, _commit, false, 0));
        emit PlayerCommitted(msg.sender, _commit);
        if (players.length == 1) {
            currentStage = 1;
            emit StageChanged(currentStage);
        }
    }

    event PlayerRevealed(address addr, uint num);

    function reveal(uint _num, string memory _salt) public {
        require(currentStage == 2, "Invalid stage");
        require(isPlayer[msg.sender], "Player has not commited");
        require(
            !players[playerIndex[msg.sender]].revealed,
            "Player already revealed"
        );
        require(
            keccak256(abi.encodePacked(_num, _salt)) ==
                players[playerIndex[msg.sender]].commit,
            "Invalid reveal"
        );
        players[playerIndex[msg.sender]].revealed = true;
        players[playerIndex[msg.sender]].num = _num;
        emit PlayerRevealed(msg.sender, _num);
    }

    event OwnerTriggeredWinnerDetermination();
    event Winner(address addr, uint num);
    event NoEligiblePlayers();
    event NoWinnerDetermination();

    function determineWinner() public onlyOwner {
        require(currentStage == 3, "Invalid stage");
        require(
            !ownerTriggeredWinnerDetermination,
            "Owner already triggered winner determination"
        );
        ownerTriggeredWinnerDetermination = true;
        emit OwnerTriggeredWinnerDetermination(); // cancel t3 timeout

        uint i;
        for (i = 0; i < players.length; i++) {
            if (
                players[i].revealed &&
                players[i].num >= 0 &&
                players[i].num <= 999
            ) {
                eligiblePlayersIndex.push(i);
                break;
            }
        }

        if (eligiblePlayersIndex.length == 0) {
            emit NoEligiblePlayers();
            payable(owner).transfer(betAmount * players.length); // 100% to owner
            reset();
            return;
        }

        uint cumXor = players[i].num;
        for (i++; i < players.length; i++) {
            if (
                players[i].revealed &&
                players[i].num >= 0 &&
                players[i].num <= 999
            ) {
                eligiblePlayersIndex.push(i);
                cumXor ^= players[i].num;
            }
        }

        uint eligiblePlayersWinnerIndex = uint(
            keccak256(abi.encodePacked(cumXor))
        ) % eligiblePlayersIndex.length;

        uint winnerIndex = eligiblePlayersIndex[eligiblePlayersWinnerIndex];
        emit Winner(players[winnerIndex].addr, players[winnerIndex].num);
        payable(players[winnerIndex].addr).transfer(
            (betAmount * players.length * 98) / 100 // 98% to winner
        );
        payable(owner).transfer((betAmount * players.length * 2) / 100); // 2% to owner
        reset();
    }

    function reset() private {
        require(
            currentStage == 4 || ownerTriggeredWinnerDetermination,
            "Invalid stage"
        );
        for (uint i = 0; i < players.length; i++) {
            isPlayer[players[i].addr] = false;
            playerIndex[players[i].addr] = 0;
        }
        delete players;
        delete eligiblePlayersIndex;
        delete ownerTriggeredWinnerDetermination;

        currentStage = 0;
        emit StageChanged(currentStage);
    }

    function handleWinnerDeterminationTimeout() private {
        require(currentStage == 4, "Invalid stage");
        emit NoWinnerDetermination();
        for (uint i = 0; i < players.length; i++) {
            withdrawableAmount[players[i].addr] += betAmount;
        }
    }

    function manualReset() public onlyOwner {
        require(currentStage == 4, "Invalid stage");
        reset();
    }

    mapping(address => uint) public withdrawableAmount; // in wei

    function withdraw() public {
        // past players can withdraw their bet at any time
        require(withdrawableAmount[msg.sender] > 0, "Nothing to withdraw");
        uint amount = withdrawableAmount[msg.sender];
        withdrawableAmount[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}
