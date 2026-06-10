// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SYNORA} from "../contracts/SYNORA.sol";
import {SYNStaking} from "../contracts/SYNStaking.sol";

contract SYNStakingTest {
    function testStakeAndUnstake() public {
        SYNORA token = new SYNORA(address(this), address(this));
        SYNStaking staking = new SYNStaking(address(token));

        uint256 stakeAmount = 1_000 * 10 ** 18;

        token.approve(address(staking), stakeAmount);
        staking.stake(stakeAmount);

        require(staking.stakedBalanceOf(address(this)) == stakeAmount, "Invalid staked balance");
        require(staking.totalStaked() == stakeAmount, "Invalid total staked");
        require(token.balanceOf(address(staking)) == stakeAmount, "Invalid staking token balance");

        staking.unstake(stakeAmount);

        require(staking.stakedBalanceOf(address(this)) == 0, "Stake not cleared");
        require(staking.totalStaked() == 0, "Total stake not cleared");
    }

    function testCannotStakeZero() public {
        SYNORA token = new SYNORA(address(this), address(this));
        SYNStaking staking = new SYNStaking(address(token));

        try staking.stake(0) {
            revert("Stake zero should fail");
        } catch {}
    }

    function testCannotUnstakeMoreThanBalance() public {
        SYNORA token = new SYNORA(address(this), address(this));
        SYNStaking staking = new SYNStaking(address(token));

        try staking.unstake(1) {
            revert("Unstake too much should fail");
        } catch {}
    }
}