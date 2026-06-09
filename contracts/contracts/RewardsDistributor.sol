// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract RewardsDistributor is EIP712, Ownable2Step {
    using SafeERC20 for IERC20;

    bytes32 public constant REWARD_CLAIM_TYPEHASH =
        keccak256("RewardClaim(bytes32 rewardId,address wallet,uint256 amount)");

    IERC20 public immutable rewardToken;

    address public rewardsSigner;

    mapping(bytes32 => bool) public claimedRewards;

    event RewardClaimed(
        bytes32 indexed rewardId,
        address indexed wallet,
        uint256 amount
    );

    event RewardsSignerUpdated(
        address indexed previousSigner,
        address indexed newSigner
    );

    error RewardsInvalidToken();
    error RewardsInvalidWallet();
    error RewardsInvalidAmount();
    error RewardsInvalidSigner();
    error RewardsAlreadyClaimed();
    error RewardsInvalidSignature();

    constructor(
        address initialOwner,
        address rewardTokenAddress,
        address initialRewardsSigner
    )
        EIP712("SYNORA Rewards", "1")
        Ownable(initialOwner)
    {
        if (rewardTokenAddress == address(0)) {
            revert RewardsInvalidToken();
        }

        if (initialRewardsSigner == address(0)) {
            revert RewardsInvalidSigner();
        }

        rewardToken = IERC20(rewardTokenAddress);
        rewardsSigner = initialRewardsSigner;
    }

    function setRewardsSigner(address newRewardsSigner) external onlyOwner {
        if (newRewardsSigner == address(0)) {
            revert RewardsInvalidSigner();
        }

        address previousSigner = rewardsSigner;
        rewardsSigner = newRewardsSigner;

        emit RewardsSignerUpdated(previousSigner, newRewardsSigner);
    }

    function claimReward(
        bytes32 rewardId,
        address wallet,
        uint256 amount
    ) external onlyOwner {
        _claimReward(rewardId, wallet, amount);
    }

    function claimWithSignature(
        bytes32 rewardId,
        address wallet,
        uint256 amount,
        bytes calldata signature
    ) external {
        if (msg.sender != wallet) {
            revert RewardsInvalidWallet();
        }

        bytes32 structHash = keccak256(
            abi.encode(
                REWARD_CLAIM_TYPEHASH,
                rewardId,
                wallet,
                amount
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address recoveredSigner = ECDSA.recover(digest, signature);

        if (recoveredSigner != rewardsSigner) {
            revert RewardsInvalidSignature();
        }

        _claimReward(rewardId, wallet, amount);
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

    function _claimReward(
        bytes32 rewardId,
        address wallet,
        uint256 amount
    ) internal {
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
}