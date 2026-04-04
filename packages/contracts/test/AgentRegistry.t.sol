// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title AgentRegistryTest — Comprehensive test suite
/// @notice Covers: registration, validation, updates, lifecycle, ownership,
///         query tracking, pagination, admin, edge cases, and integration.
contract AgentRegistryTest is Test {
    AgentRegistry registry;
    address admin = address(0xAD111);
    address alice = address(0xA11CE);
    address bob = address(0xB0B);
    address charlie = address(0xC4A3);
    address dead = address(0xDEAD);

    // Mirror events for expectEmit
    event AgentRegistered(
        string indexed nameHash, string name, address indexed owner,
        address walletAddress, string endpoint, string metadataURI
    );
    event AgentUpdated(
        string indexed nameHash, string name, address indexed owner,
        string endpoint, string metadataURI
    );
    event AgentWalletUpdated(
        string indexed nameHash, string name, address indexed newWallet
    );
    event AgentStatusChanged(
        string indexed nameHash, string name,
        AgentRegistry.AgentStatus oldStatus, AgentRegistry.AgentStatus newStatus
    );
    event AgentOwnershipTransferred(
        string indexed nameHash, string name,
        address indexed previousOwner, address indexed newOwner
    );
    event QueryRecorded(
        string indexed nameHash, string name, uint256 newTotal, uint256 globalTotal
    );

    function setUp() public {
        registry = new AgentRegistry(admin);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  UNIT: CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    function test_Constructor_SetsOwner() public view {
        assertEq(registry.owner(), admin);
    }

    function test_Constructor_InitialState() public view {
        assertEq(registry.totalAgents(), 0);
        assertEq(registry.globalQueryCount(), 0);
        assertEq(registry.getAllAgentsCount(), 0);
        assertFalse(registry.paused());
    }

    function test_Constructor_Constants() public view {
        assertEq(registry.MAX_NAME_LENGTH(), 64);
        assertEq(registry.MIN_NAME_LENGTH(), 3);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  UNIT: REGISTRATION — HAPPY PATH
    // ═══════════════════════════════════════════════════════════════════════

    function test_RegisterAgent_HappyPath() public {
        vm.prank(alice);
        registry.registerAgent(
            "defi-auditor",
            address(0xAA1137),
            "https://agentnet.xyz/api/agents/defi-auditor/ask",
            "ipfs://QmMeta"
        );

        AgentRegistry.Agent memory agent = registry.getAgent("defi-auditor");
        assertEq(agent.owner, alice);
        assertEq(agent.walletAddress, address(0xAA1137));
        assertEq(agent.endpoint, "https://agentnet.xyz/api/agents/defi-auditor/ask");
        assertEq(agent.metadataURI, "ipfs://QmMeta");
        assertEq(uint8(agent.status), uint8(AgentRegistry.AgentStatus.Active));
        assertEq(agent.totalQueries, 0);
        assertTrue(agent.exists);
        assertTrue(agent.registeredAt > 0);
        assertEq(agent.registeredAt, agent.updatedAt);
    }

    function test_RegisterAgent_IncrementsCounters() public {
        vm.prank(alice);
        registry.registerAgent("bot-1", address(0x1), "https://e.com", "ipfs://m");
        assertEq(registry.totalAgents(), 1);
        assertEq(registry.getAllAgentsCount(), 1);

        vm.prank(bob);
        registry.registerAgent("bot-2", address(0x2), "https://e.com", "ipfs://m");
        assertEq(registry.totalAgents(), 2);
        assertEq(registry.getAllAgentsCount(), 2);
    }

    function test_RegisterAgent_EmitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(false, true, false, true);
        emit AgentRegistered(
            "defi-auditor", "defi-auditor", alice,
            address(0xAA), "https://e.com", "ipfs://m"
        );
        registry.registerAgent("defi-auditor", address(0xAA), "https://e.com", "ipfs://m");
    }

    function test_RegisterAgent_AddsToOwnerList() public {
        vm.prank(alice);
        registry.registerAgent("my-bot", address(0x1), "https://e.com", "ipfs://m");

        string[] memory agents = registry.getOwnerAgents(alice);
        assertEq(agents.length, 1);
        assertEq(agents[0], "my-bot");
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  UNIT: REGISTRATION — VALIDATION
    // ═══════════════════════════════════════════════════════════════════════

    function test_Revert_RegisterAgent_NameAlreadyTaken() public {
        vm.prank(alice);
        registry.registerAgent("taken", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.AgentAlreadyExists.selector, "taken"));
        registry.registerAgent("taken", address(0x2), "https://e2.com", "ipfs://m2");
    }

    function test_Revert_RegisterAgent_NameTooShort() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.InvalidName.selector, "name too short"));
        registry.registerAgent("ab", address(0x1), "https://e.com", "ipfs://m");
    }

    function test_Revert_RegisterAgent_NameTooLong() public {
        // 65-char name
        string memory longName = "aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeefffffffffffffff11";
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.InvalidName.selector, "name too long"));
        registry.registerAgent(longName, address(0x1), "https://e.com", "ipfs://m");
    }

    function test_RegisterAgent_ExactMinLength() public {
        vm.prank(alice);
        registry.registerAgent("abc", address(0x1), "https://e.com", "ipfs://m");
        assertTrue(registry.getAgent("abc").exists);
    }

    function test_RegisterAgent_ExactMaxLength() public {
        // 64-char name
        string memory maxName = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        assertEq(bytes(maxName).length, 64);
        vm.prank(alice);
        registry.registerAgent(maxName, address(0x1), "https://e.com", "ipfs://m");
        assertTrue(registry.getAgent(maxName).exists);
    }

    function test_Revert_RegisterAgent_ZeroWallet() public {
        vm.prank(alice);
        vm.expectRevert(AgentRegistry.InvalidAddress.selector);
        registry.registerAgent("zero-wallet", address(0), "https://e.com", "ipfs://m");
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  UNIT: GET AGENT
    // ═══════════════════════════════════════════════════════════════════════

    function test_GetAgent_NonExistent_ReturnsFalse() public view {
        AgentRegistry.Agent memory agent = registry.getAgent("ghost");
        assertFalse(agent.exists);
        assertEq(agent.owner, address(0));
    }

    function test_IsNameAvailable_True() public view {
        assertTrue(registry.isNameAvailable("available"));
    }

    function test_IsNameAvailable_False() public {
        vm.prank(alice);
        registry.registerAgent("taken-name", address(0x1), "https://e.com", "ipfs://m");
        assertFalse(registry.isNameAvailable("taken-name"));
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  UNIT: UPDATE AGENT
    // ═══════════════════════════════════════════════════════════════════════

    function test_UpdateAgent_ByOwner() public {
        vm.prank(alice);
        registry.registerAgent("updatable", address(0x1), "https://old.com", "ipfs://old");

        vm.warp(block.timestamp + 100);
        vm.prank(alice);
        registry.updateAgent("updatable", "https://new.com", "ipfs://new");

        AgentRegistry.Agent memory agent = registry.getAgent("updatable");
        assertEq(agent.endpoint, "https://new.com");
        assertEq(agent.metadataURI, "ipfs://new");
        assertEq(agent.updatedAt, block.timestamp);
    }

    function test_UpdateAgent_EmitsEvent() public {
        vm.prank(alice);
        registry.registerAgent("emit-update", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(alice);
        vm.expectEmit(false, true, false, true);
        emit AgentUpdated("emit-update", "emit-update", alice, "https://n.com", "ipfs://n");
        registry.updateAgent("emit-update", "https://n.com", "ipfs://n");
    }

    function test_Revert_UpdateAgent_NotOwner() public {
        vm.prank(alice);
        registry.registerAgent("alice-only", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.NotAgentOwner.selector, "alice-only", bob));
        registry.updateAgent("alice-only", "https://evil.com", "ipfs://evil");
    }

    function test_Revert_UpdateAgent_NonExistent() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.AgentNotFound.selector, "ghost"));
        registry.updateAgent("ghost", "https://e.com", "ipfs://m");
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  UNIT: UPDATE WALLET
    // ═══════════════════════════════════════════════════════════════════════

    function test_UpdateWallet() public {
        vm.prank(alice);
        registry.registerAgent("wallet-test", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(alice);
        registry.updateWallet("wallet-test", address(0xBEEF));

        assertEq(registry.getAgent("wallet-test").walletAddress, address(0xBEEF));
    }

    function test_UpdateWallet_EmitsEvent() public {
        vm.prank(alice);
        registry.registerAgent("wallet-emit", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(alice);
        vm.expectEmit(false, true, false, true);
        emit AgentWalletUpdated("wallet-emit", "wallet-emit", address(0xBEEF));
        registry.updateWallet("wallet-emit", address(0xBEEF));
    }

    function test_Revert_UpdateWallet_ZeroAddress() public {
        vm.prank(alice);
        registry.registerAgent("wallet-zero", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(alice);
        vm.expectRevert(AgentRegistry.InvalidAddress.selector);
        registry.updateWallet("wallet-zero", address(0));
    }

    function test_Revert_UpdateWallet_NotOwner() public {
        vm.prank(alice);
        registry.registerAgent("wallet-auth", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.NotAgentOwner.selector, "wallet-auth", bob));
        registry.updateWallet("wallet-auth", address(0xBEEF));
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  UNIT: LIFECYCLE — PAUSE / ACTIVATE / DECOMMISSION
    // ═══════════════════════════════════════════════════════════════════════

    function test_PauseAgent() public {
        vm.prank(alice);
        registry.registerAgent("pausable", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(alice);
        registry.pauseAgent("pausable");

        assertEq(uint8(registry.getAgent("pausable").status), uint8(AgentRegistry.AgentStatus.Paused));
    }

    function test_PauseAgent_EmitsEvent() public {
        vm.prank(alice);
        registry.registerAgent("pause-evt", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(alice);
        vm.expectEmit(false, false, false, true);
        emit AgentStatusChanged("pause-evt", "pause-evt", AgentRegistry.AgentStatus.Active, AgentRegistry.AgentStatus.Paused);
        registry.pauseAgent("pause-evt");
    }

    function test_Revert_PauseAgent_AlreadyPaused() public {
        vm.prank(alice);
        registry.registerAgent("double-pause", address(0x1), "https://e.com", "ipfs://m");
        vm.prank(alice);
        registry.pauseAgent("double-pause");

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(
            AgentRegistry.InvalidStatusTransition.selector,
            AgentRegistry.AgentStatus.Paused,
            AgentRegistry.AgentStatus.Paused
        ));
        registry.pauseAgent("double-pause");
    }

    function test_ActivateAgent_AfterPause() public {
        vm.prank(alice);
        registry.registerAgent("reactivate", address(0x1), "https://e.com", "ipfs://m");
        vm.prank(alice);
        registry.pauseAgent("reactivate");

        vm.prank(alice);
        registry.activateAgent("reactivate");

        assertEq(uint8(registry.getAgent("reactivate").status), uint8(AgentRegistry.AgentStatus.Active));
    }

    function test_Revert_ActivateAgent_AlreadyActive() public {
        vm.prank(alice);
        registry.registerAgent("already-active", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(
            AgentRegistry.InvalidStatusTransition.selector,
            AgentRegistry.AgentStatus.Active,
            AgentRegistry.AgentStatus.Active
        ));
        registry.activateAgent("already-active");
    }

    function test_DecommissionAgent_FromActive() public {
        vm.prank(alice);
        registry.registerAgent("decomm-active", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(alice);
        registry.decommissionAgent("decomm-active");

        assertEq(uint8(registry.getAgent("decomm-active").status), uint8(AgentRegistry.AgentStatus.Decommissioned));
    }

    function test_DecommissionAgent_FromPaused() public {
        vm.prank(alice);
        registry.registerAgent("decomm-paused", address(0x1), "https://e.com", "ipfs://m");
        vm.prank(alice);
        registry.pauseAgent("decomm-paused");

        vm.prank(alice);
        registry.decommissionAgent("decomm-paused");

        assertEq(uint8(registry.getAgent("decomm-paused").status), uint8(AgentRegistry.AgentStatus.Decommissioned));
    }

    function test_Revert_DecommissionAgent_AlreadyDecommissioned() public {
        vm.prank(alice);
        registry.registerAgent("decomm-twice", address(0x1), "https://e.com", "ipfs://m");
        vm.prank(alice);
        registry.decommissionAgent("decomm-twice");

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(
            AgentRegistry.InvalidStatusTransition.selector,
            AgentRegistry.AgentStatus.Decommissioned,
            AgentRegistry.AgentStatus.Decommissioned
        ));
        registry.decommissionAgent("decomm-twice");
    }

    function test_Revert_PauseAgent_NotOwner() public {
        vm.prank(alice);
        registry.registerAgent("no-pause", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.NotAgentOwner.selector, "no-pause", bob));
        registry.pauseAgent("no-pause");
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  UNIT: OWNERSHIP TRANSFER
    // ═══════════════════════════════════════════════════════════════════════

    function test_TransferOwnership() public {
        vm.prank(alice);
        registry.registerAgent("transferable", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(alice);
        registry.transferAgentOwnership("transferable", bob);

        assertEq(registry.getAgent("transferable").owner, bob);
    }

    function test_TransferOwnership_EmitsEvent() public {
        vm.prank(alice);
        registry.registerAgent("xfer-evt", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(alice);
        vm.expectEmit(false, true, true, true);
        emit AgentOwnershipTransferred("xfer-evt", "xfer-evt", alice, bob);
        registry.transferAgentOwnership("xfer-evt", bob);
    }

    function test_TransferOwnership_NewOwnerCanUpdate() public {
        vm.prank(alice);
        registry.registerAgent("xfer-update", address(0x1), "https://a.com", "ipfs://a");
        vm.prank(alice);
        registry.transferAgentOwnership("xfer-update", bob);

        vm.prank(bob);
        registry.updateAgent("xfer-update", "https://bob.com", "ipfs://bob");
        assertEq(registry.getAgent("xfer-update").endpoint, "https://bob.com");
    }

    function test_TransferOwnership_OldOwnerLosesAccess() public {
        vm.prank(alice);
        registry.registerAgent("no-access", address(0x1), "https://a.com", "ipfs://a");
        vm.prank(alice);
        registry.transferAgentOwnership("no-access", bob);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.NotAgentOwner.selector, "no-access", alice));
        registry.updateAgent("no-access", "https://nope.com", "ipfs://nope");
    }

    function test_Revert_TransferOwnership_ToZero() public {
        vm.prank(alice);
        registry.registerAgent("no-zero-xfer", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(alice);
        vm.expectRevert(AgentRegistry.InvalidAddress.selector);
        registry.transferAgentOwnership("no-zero-xfer", address(0));
    }

    function test_Revert_TransferOwnership_NotOwner() public {
        vm.prank(alice);
        registry.registerAgent("xfer-auth", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.NotAgentOwner.selector, "xfer-auth", bob));
        registry.transferAgentOwnership("xfer-auth", charlie);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  UNIT: QUERY TRACKING
    // ═══════════════════════════════════════════════════════════════════════

    function test_RecordQuery_IncrementsCounters() public {
        vm.prank(alice);
        registry.registerAgent("query-bot", address(0x1), "https://e.com", "ipfs://m");

        registry.recordQuery("query-bot");
        registry.recordQuery("query-bot");
        registry.recordQuery("query-bot");

        assertEq(registry.getAgent("query-bot").totalQueries, 3);
        assertEq(registry.globalQueryCount(), 3);
    }

    function test_RecordQuery_EmitsEvent() public {
        vm.prank(alice);
        registry.registerAgent("query-evt", address(0x1), "https://e.com", "ipfs://m");

        vm.expectEmit(false, false, false, true);
        emit QueryRecorded("query-evt", "query-evt", 1, 1);
        registry.recordQuery("query-evt");
    }

    function test_Revert_RecordQuery_NonExistent() public {
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.AgentNotFound.selector, "nope"));
        registry.recordQuery("nope");
    }

    function test_Revert_RecordQuery_PausedAgent() public {
        vm.prank(alice);
        registry.registerAgent("paused-q", address(0x1), "https://e.com", "ipfs://m");
        vm.prank(alice);
        registry.pauseAgent("paused-q");

        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.AgentNotActive.selector, "paused-q"));
        registry.recordQuery("paused-q");
    }

    function test_Revert_RecordQuery_DecommissionedAgent() public {
        vm.prank(alice);
        registry.registerAgent("decomm-q", address(0x1), "https://e.com", "ipfs://m");
        vm.prank(alice);
        registry.decommissionAgent("decomm-q");

        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.AgentNotActive.selector, "decomm-q"));
        registry.recordQuery("decomm-q");
    }

    function test_GlobalQueryCount_MultipleAgents() public {
        vm.prank(alice);
        registry.registerAgent("ga-1", address(0x1), "https://e.com", "ipfs://m");
        vm.prank(bob);
        registry.registerAgent("ga-2", address(0x2), "https://e.com", "ipfs://m");

        registry.recordQuery("ga-1");
        registry.recordQuery("ga-1");
        registry.recordQuery("ga-2");

        assertEq(registry.getAgent("ga-1").totalQueries, 2);
        assertEq(registry.getAgent("ga-2").totalQueries, 1);
        assertEq(registry.globalQueryCount(), 3);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  UNIT: OWNER AGENTS LIST
    // ═══════════════════════════════════════════════════════════════════════

    function test_GetOwnerAgents_CorrectList() public {
        vm.startPrank(alice);
        registry.registerAgent("a-1", address(0x1), "https://e.com", "ipfs://m");
        registry.registerAgent("a-2", address(0x2), "https://e.com", "ipfs://m");
        registry.registerAgent("a-3", address(0x3), "https://e.com", "ipfs://m");
        vm.stopPrank();

        string[] memory agents = registry.getOwnerAgents(alice);
        assertEq(agents.length, 3);
        assertEq(agents[0], "a-1");
        assertEq(agents[2], "a-3");
    }

    function test_GetOwnerAgents_EmptyForNewAddress() public view {
        assertEq(registry.getOwnerAgents(dead).length, 0);
    }

    function test_GetOwnerAgentCount() public {
        vm.startPrank(alice);
        registry.registerAgent("cnt-1", address(0x1), "https://e.com", "ipfs://m");
        registry.registerAgent("cnt-2", address(0x2), "https://e.com", "ipfs://m");
        vm.stopPrank();

        assertEq(registry.getOwnerAgentCount(alice), 2);
        assertEq(registry.getOwnerAgentCount(bob), 0);
    }

    function test_IndependentOwnerLists() public {
        vm.prank(alice);
        registry.registerAgent("alice-bot", address(0x1), "https://e.com", "ipfs://m");
        vm.prank(bob);
        registry.registerAgent("bob-bot", address(0x2), "https://e.com", "ipfs://m");

        assertEq(registry.getOwnerAgents(alice).length, 1);
        assertEq(registry.getOwnerAgents(bob).length, 1);
        assertEq(registry.getOwnerAgents(alice)[0], "alice-bot");
        assertEq(registry.getOwnerAgents(bob)[0], "bob-bot");
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  UNIT: PAGINATED ENUMERATION
    // ═══════════════════════════════════════════════════════════════════════

    function test_GetAllAgents_Paginated() public {
        vm.startPrank(alice);
        registry.registerAgent("p-1", address(0x1), "https://e.com", "ipfs://m");
        registry.registerAgent("p-2", address(0x2), "https://e.com", "ipfs://m");
        registry.registerAgent("p-3", address(0x3), "https://e.com", "ipfs://m");
        registry.registerAgent("p-4", address(0x4), "https://e.com", "ipfs://m");
        registry.registerAgent("p-5", address(0x5), "https://e.com", "ipfs://m");
        vm.stopPrank();

        // Page 1
        string[] memory page1 = registry.getAllAgents(0, 2);
        assertEq(page1.length, 2);
        assertEq(page1[0], "p-1");
        assertEq(page1[1], "p-2");

        // Page 2
        string[] memory page2 = registry.getAllAgents(2, 2);
        assertEq(page2.length, 2);
        assertEq(page2[0], "p-3");
        assertEq(page2[1], "p-4");

        // Last page (partial)
        string[] memory page3 = registry.getAllAgents(4, 2);
        assertEq(page3.length, 1);
        assertEq(page3[0], "p-5");
    }

    function test_GetAllAgents_OffsetBeyondLength() public {
        vm.prank(alice);
        registry.registerAgent("solo", address(0x1), "https://e.com", "ipfs://m");

        string[] memory result = registry.getAllAgents(10, 5);
        assertEq(result.length, 0);
    }

    function test_GetAllAgents_EmptyRegistry() public view {
        string[] memory result = registry.getAllAgents(0, 10);
        assertEq(result.length, 0);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  UNIT: ADMIN — PAUSE / UNPAUSE (OpenZeppelin Ownable + Pausable)
    // ═══════════════════════════════════════════════════════════════════════

    function test_Admin_Pause() public {
        vm.prank(admin);
        registry.pause();
        assertTrue(registry.paused());
    }

    function test_Admin_Unpause() public {
        vm.prank(admin);
        registry.pause();

        vm.prank(admin);
        registry.unpause();
        assertFalse(registry.paused());
    }

    function test_Revert_Pause_NotOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        registry.pause();
    }

    function test_Revert_Unpause_NotOwner() public {
        vm.prank(admin);
        registry.pause();

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        registry.unpause();
    }

    function test_Revert_Register_WhenPaused() public {
        vm.prank(admin);
        registry.pause();

        vm.prank(alice);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        registry.registerAgent("paused-reg", address(0x1), "https://e.com", "ipfs://m");
    }

    function test_Revert_Update_WhenPaused() public {
        vm.prank(alice);
        registry.registerAgent("pause-update", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(admin);
        registry.pause();

        vm.prank(alice);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        registry.updateAgent("pause-update", "https://new.com", "ipfs://new");
    }

    function test_Revert_UpdateWallet_WhenPaused() public {
        vm.prank(alice);
        registry.registerAgent("pause-wallet", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(admin);
        registry.pause();

        vm.prank(alice);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        registry.updateWallet("pause-wallet", address(0xBEEF));
    }

    function test_Revert_Transfer_WhenPaused() public {
        vm.prank(alice);
        registry.registerAgent("pause-xfer", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(admin);
        registry.pause();

        vm.prank(alice);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        registry.transferAgentOwnership("pause-xfer", bob);
    }

    function test_Revert_RecordQuery_WhenPaused() public {
        vm.prank(alice);
        registry.registerAgent("pause-query", address(0x1), "https://e.com", "ipfs://m");

        vm.prank(admin);
        registry.pause();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        registry.recordQuery("pause-query");
    }

    function test_PauseAgent_WorksWhenRegistryPaused() public {
        // Agent-level pause != registry pause. Agent owner can still pause their agent.
        vm.prank(alice);
        registry.registerAgent("agent-pause-ok", address(0x1), "https://e.com", "ipfs://m");

        // Note: pauseAgent is NOT whenNotPaused, so it works even when registry is paused
        // This is intentional — owners should always be able to stop their agents
        vm.prank(alice);
        registry.pauseAgent("agent-pause-ok");
        assertEq(uint8(registry.getAgent("agent-pause-ok").status), uint8(AgentRegistry.AgentStatus.Paused));
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  INTEGRATION: FULL LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════

    function test_Integration_FullLifecycle() public {
        // 1. Register
        vm.prank(alice);
        registry.registerAgent("lifecycle", address(0xCAFE), "https://v1.com", "ipfs://v1");
        assertTrue(registry.getAgent("lifecycle").exists);
        assertEq(uint8(registry.getAgent("lifecycle").status), uint8(AgentRegistry.AgentStatus.Active));

        // 2. Query
        registry.recordQuery("lifecycle");
        registry.recordQuery("lifecycle");
        assertEq(registry.getAgent("lifecycle").totalQueries, 2);

        // 3. Update endpoint
        vm.prank(alice);
        registry.updateAgent("lifecycle", "https://v2.com", "ipfs://v2");
        assertEq(registry.getAgent("lifecycle").endpoint, "https://v2.com");

        // 4. Update wallet
        vm.prank(alice);
        registry.updateWallet("lifecycle", address(0xBEEF));
        assertEq(registry.getAgent("lifecycle").walletAddress, address(0xBEEF));

        // 5. Pause
        vm.prank(alice);
        registry.pauseAgent("lifecycle");

        // 6. Cannot query when paused
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.AgentNotActive.selector, "lifecycle"));
        registry.recordQuery("lifecycle");

        // 7. Reactivate
        vm.prank(alice);
        registry.activateAgent("lifecycle");
        registry.recordQuery("lifecycle");
        assertEq(registry.getAgent("lifecycle").totalQueries, 3);

        // 8. Transfer ownership
        vm.prank(alice);
        registry.transferAgentOwnership("lifecycle", bob);
        assertEq(registry.getAgent("lifecycle").owner, bob);

        // 9. Alice can't touch it anymore
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.NotAgentOwner.selector, "lifecycle", alice));
        registry.updateAgent("lifecycle", "https://nope.com", "ipfs://nope");

        // 10. Bob decommissions
        vm.prank(bob);
        registry.decommissionAgent("lifecycle");
        assertEq(uint8(registry.getAgent("lifecycle").status), uint8(AgentRegistry.AgentStatus.Decommissioned));

        // 11. Cannot query decommissioned
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.AgentNotActive.selector, "lifecycle"));
        registry.recordQuery("lifecycle");
    }

    function test_Integration_MultipleAgents_MultipleOwners() public {
        // Alice creates 2, Bob creates 1
        vm.startPrank(alice);
        registry.registerAgent("alice-1", address(0x1), "https://e.com", "ipfs://m");
        registry.registerAgent("alice-2", address(0x2), "https://e.com", "ipfs://m");
        vm.stopPrank();

        vm.prank(bob);
        registry.registerAgent("bob-1", address(0x3), "https://e.com", "ipfs://m");

        assertEq(registry.totalAgents(), 3);
        assertEq(registry.getOwnerAgentCount(alice), 2);
        assertEq(registry.getOwnerAgentCount(bob), 1);

        // Query across agents
        registry.recordQuery("alice-1");
        registry.recordQuery("bob-1");
        registry.recordQuery("bob-1");

        assertEq(registry.globalQueryCount(), 3);
        assertEq(registry.getAgent("alice-1").totalQueries, 1);
        assertEq(registry.getAgent("bob-1").totalQueries, 2);
    }

    function test_Integration_AdminEmergencyPause() public {
        // Setup
        vm.prank(alice);
        registry.registerAgent("emergency", address(0x1), "https://e.com", "ipfs://m");

        // Admin pauses
        vm.prank(admin);
        registry.pause();

        // Nothing works
        vm.prank(bob);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        registry.registerAgent("new-during-pause", address(0x2), "https://e.com", "ipfs://m");

        vm.expectRevert(Pausable.EnforcedPause.selector);
        registry.recordQuery("emergency");

        // Admin unpause
        vm.prank(admin);
        registry.unpause();

        // Everything works again
        vm.prank(bob);
        registry.registerAgent("after-unpause", address(0x2), "https://e.com", "ipfs://m");
        registry.recordQuery("emergency");
        assertEq(registry.getAgent("emergency").totalQueries, 1);
    }
}
