// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SYNStaking {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;

    uint256 public totalStaked;

    mapping(address => uint256) private stakedBalances;

    event Staked(address indexed wallet, uint256 amount);
    event Unstaked(address indexed wallet, uint256 amount);

    error StakingInvalidToken();
    error StakingInvalidAmount();
    error StakingInsufficientBalance();

    constructor(address stakingTokenAddress) {
        if (stakingTokenAddress == address(0)) {
            revert StakingInvalidToken();
        }

        stakingToken = IERC20(stakingTokenAddress);
    }

    function stake(uint256 amount) external {
        if (amount == 0) {
            revert StakingInvalidAmount();
        }

        stakedBalances[msg.sender] += amount;
        totalStaked += amount;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        if (amount == 0) {
            revert StakingInvalidAmount();
        }

        uint256 currentBalance = stakedBalances[msg.sender];

        if (currentBalance < amount) {
            revert StakingInsufficientBalance();
        }

        stakedBalances[msg.sender] = currentBalance - amount;
        totalStaked -= amount;

        stakingToken.safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    function stakedBalanceOf(address wallet) external view returns (uint256) {
        return stakedBalances[wallet];
    }
}