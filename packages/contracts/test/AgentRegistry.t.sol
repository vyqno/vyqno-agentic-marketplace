// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AgentRegistry.sol";

contract AgentRegistryTest is Test {
    AgentRegistry registry;

    function setUp() public {
        registry = new AgentRegistry();
    }

    function testVersion() public view {
        assertEq(registry.VERSION(), "0.1.0");
    }
}
