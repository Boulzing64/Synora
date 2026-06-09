// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SYNORA} from "../contracts/SYNORA.sol";
import {RewardsDistributor} from "../contracts/RewardsDistributor.sol";

contract RewardsDistributorTest {
    function testClaimRewardByOwner() public {
        SYNORA token = new SYNORA(address(this), address(this));

        RewardsDistributor distributor = new RewardsDistributor(
            address(this),
            address(token),
            address(this)
        );

        uint256 fundingAmount = 1_000 * 10 ** 18;
        uint256 rewardAmount = 10 * 10 ** 18;
        address wallet = address(0x1234);
        bytes32 rewardId = keccak256("reward-1");

        token.transfer(address(distributor), fundingAmount);

        distributor.claimReward(rewardId, wallet, rewardAmount);

        require(token.balanceOf(wallet) == rewardAmount, "Invalid wallet reward balance");
        require(distributor.claimedRewards(rewardId), "Reward not marked claimed");
    }

    function testSetRewardsSigner() public {
        SYNORA token = new SYNORA(address(this), address(this));

        RewardsDistributor distributor = new RewardsDistributor(
            address(this),
            address(token),
            address(this)
        );

        address newSigner = address(0x9999);

        distributor.setRewardsSigner(newSigner);

        require(distributor.rewardsSigner() == newSigner, "Invalid rewards signer");
    }

    function testWithdraw() public {
        SYNORA token = new SYNORA(address(this), address(this));

        RewardsDistributor distributor = new RewardsDistributor(
            address(this),
            address(token),
            address(this)
        );

        uint256 fundingAmount = 1_000 * 10 ** 18;
        address recipient = address(0x5678);

        token.transfer(address(distributor), fundingAmount);
        distributor.withdraw(recipient, fundingAmount);

        require(token.balanceOf(recipient) == fundingAmount, "Invalid withdraw balance");
    }
}