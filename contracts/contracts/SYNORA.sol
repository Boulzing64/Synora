// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

contract SYNORA is ERC20, ERC20Burnable, Ownable2Step {
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10 ** 18;

    error SynoraInvalidOwner();
    error SynoraInvalidRecipient();

    constructor(address initialOwner, address initialRecipient)
        ERC20("SYNORA", "SYN")
        Ownable(initialOwner)
    {
        if (initialOwner == address(0)) {
            revert SynoraInvalidOwner();
        }

        if (initialRecipient == address(0)) {
            revert SynoraInvalidRecipient();
        }

        _mint(initialRecipient, INITIAL_SUPPLY);
    }
}