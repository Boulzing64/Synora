// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SYNORA} from "../contracts/SYNORA.sol";

contract SYNORATest {
    function testInitialSupplyAndMetadata() public {
        SYNORA token = new SYNORA(address(this), address(this));

        require(
            keccak256(bytes(token.name())) == keccak256(bytes("SYNORA")),
            "Invalid token name"
        );

        require(
            keccak256(bytes(token.symbol())) == keccak256(bytes("SYN")),
            "Invalid token symbol"
        );

        require(token.decimals() == 18, "Invalid decimals");
        require(token.totalSupply() == token.INITIAL_SUPPLY(), "Invalid total supply");
        require(token.balanceOf(address(this)) == token.INITIAL_SUPPLY(), "Invalid owner balance");
        require(token.owner() == address(this), "Invalid owner");
    }

    function testBurn() public {
        SYNORA token = new SYNORA(address(this), address(this));

        uint256 burnAmount = 1_000 * 10 ** 18;
        uint256 initialSupply = token.totalSupply();

        token.burn(burnAmount);

        require(token.totalSupply() == initialSupply - burnAmount, "Invalid supply after burn");
        require(
            token.balanceOf(address(this)) == initialSupply - burnAmount,
            "Invalid balance after burn"
        );
    }
}