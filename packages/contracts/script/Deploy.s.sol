// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";

/// @notice Deploy AgentRegistry to Base Sepolia
/// @dev Run: forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // deployer becomes the contract admin (Ownable owner)
        AgentRegistry registry = new AgentRegistry(deployer);

        console.log("=================================");
        console.log("AgentRegistry deployed at:", address(registry));
        console.log("Admin (owner):", deployer);
        console.log("Chain: Base Sepolia (84532)");
        console.log("=================================");

        vm.stopBroadcast();
    }
}
