// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

contract E2ESafe is Script {
    function run(address safe, address to, uint256 value, bytes calldata data) public {
        if (value > 0) {
            vm.deal(safe, value);
        }
        vm.prank(safe);
        (bool success, bytes memory returnData) = to.call{value: value}(data);

        if (success) {
            console.log("SAFE_SIM_SUCCESS");
        } else {
            console.log("SAFE_SIM_REVERTED");
            console.logBytes(returnData);
        }
    }
}
