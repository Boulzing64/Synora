// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract RewardsDistributor is Ownable2Step {
    using SafeERC20 for IERC20;

    IERC20 public immutable rewardToken;

    mapping(bytes32 => bool) public claimedRewards;

    event RewardClaimed(
        bytes32 indexed rewardId,
        address indexed wallet,
        uint256 amount
    );

    error RewardsInvalidToken();
    error RewardsInvalidWallet();
    error RewardsInvalidAmount();
    error RewardsAlreadyClaimed();

    constructor(address initialOwner, address rewardTokenAddress)
        Ownable(initialOwner)
    {
        if (rewardTokenAddress == address(0)) {
            revert RewardsInvalidToken();
        }

        rewardToken = IERC20(rewardTokenAddress);
    }

    function claimReward(
        bytes32 rewardId,
        address wallet,
        uint256 amount
    ) external onlyOwner {
        if (wallet == address(0)) {
            revert RewardsInvalidWallet();
        }

        if (amount == 0) {
            revert RewardsInvalidAmount();
        }

        if (claimedRewards[rewardId]) {
            revert RewardsAlreadyClaimed();
        }

        claimedRewards[rewardId] = true;

        rewardToken.safeTransfer(wallet, amount);

        emit RewardClaimed(rewardId, wallet, amount);
    }

    function withdraw(address recipient, uint256 amount) external onlyOwner {
        if (recipient == address(0)) {
            revert RewardsInvalidWallet();
        }

        if (amount == 0) {
            revert RewardsInvalidAmount();
        }

        rewardToken.safeTransfer(recipient, amount);
    }
}