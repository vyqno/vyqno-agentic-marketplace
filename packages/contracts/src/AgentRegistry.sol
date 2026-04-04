// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title AgentRegistry — Onchain registry for the AgentNet marketplace
/// @author AgentNet Team
/// @notice Production-grade onchain registry for AI agents with ownership,
///         lifecycle management, query tracking, and ownership transfer.
/// @dev Deployed on Base Sepolia. Uses OpenZeppelin for security patterns.
///      - Ownable: contract-level admin (can pause/unpause the whole registry)
///      - Pausable: emergency stop mechanism for the entire registry
///      - ReentrancyGuard: protects state-mutating functions
contract AgentRegistry is Ownable, Pausable, ReentrancyGuard {
    // ═══════════════════════════════════════════════════════════════════════
    //  TYPES
    // ═══════════════════════════════════════════════════════════════════════

    enum AgentStatus {
        Active,     // 0 — accepting queries
        Paused,     // 1 — temporarily stopped
        Decommissioned // 2 — permanently retired
    }

    struct Agent {
        address owner;
        address walletAddress;
        string endpoint;
        string metadataURI;
        string ensName; // Optional ENS/Basename associated with the agent
        AgentStatus status;
        uint256 totalQueries;
        uint256 registeredAt;
        uint256 updatedAt;
        bool exists;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  STORAGE
    // ═══════════════════════════════════════════════════════════════════════

    mapping(string name => Agent) private _agents;
    mapping(address owner => string[]) private _ownerAgents;

    string[] private _allAgentNames;
    uint256 public totalAgents;
    uint256 public globalQueryCount;

    /// @notice Max name length to prevent gas griefing
    uint256 public constant MAX_NAME_LENGTH = 64;

    /// @notice Min name length
    uint256 public constant MIN_NAME_LENGTH = 3;

    // ═══════════════════════════════════════════════════════════════════════
    //  EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event AgentRegistered(
        string indexed nameHash,
        string name,
        address indexed owner,
        address walletAddress,
        string endpoint,
        string metadataURI,
        string ensName
    );

    event AgentUpdated(
        string indexed nameHash,
        string name,
        address indexed owner,
        string endpoint,
        string metadataURI
    );

    event AgentWalletUpdated(
        string indexed nameHash,
        string name,
        address indexed newWallet
    );

    event AgentStatusChanged(
        string indexed nameHash,
        string name,
        AgentStatus oldStatus,
        AgentStatus newStatus
    );

    event AgentOwnershipTransferred(
        string indexed nameHash,
        string name,
        address indexed previousOwner,
        address indexed newOwner
    );

    event QueryRecorded(
        string indexed nameHash,
        string name,
        uint256 newTotal,
        uint256 globalTotal
    );

    // ═══════════════════════════════════════════════════════════════════════
    //  ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error AgentAlreadyExists(string name);
    error AgentNotFound(string name);
    error NotAgentOwner(string name, address caller);
    error InvalidAddress();
    error InvalidName(string reason);
    error AgentNotActive(string name);
    error InvalidStatusTransition(AgentStatus current, AgentStatus target);

    // ═══════════════════════════════════════════════════════════════════════
    //  MODIFIERS
    // ═══════════════════════════════════════════════════════════════════════

    modifier onlyAgentOwner(string calldata name) {
        if (!_agents[name].exists) revert AgentNotFound(name);
        if (_agents[name].owner != msg.sender) revert NotAgentOwner(name, msg.sender);
        _;
    }

    modifier agentMustExist(string calldata name) {
        if (!_agents[name].exists) revert AgentNotFound(name);
        _;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    /// @param initialOwner The admin address that can pause/unpause the registry
    constructor(address initialOwner) Ownable(initialOwner) {}

    // ═══════════════════════════════════════════════════════════════════════
    //  REGISTRATION
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Register a new agent on the registry
    /// @param name Unique agent name (3-64 chars, validated)
    /// @param walletAddress The agent's programmatic wallet on Base Sepolia
    /// @param endpoint The API endpoint for querying the agent
    /// @param metadataURI URI pointing to agent metadata
    /// @param ensName Optional ENS/Basename (e.g., satoshi.base.eth)
    function registerAgent(
        string calldata name,
        address walletAddress,
        string calldata endpoint,
        string calldata metadataURI,
        string calldata ensName
    ) external whenNotPaused nonReentrant {
        _validateName(name);
        if (walletAddress == address(0)) revert InvalidAddress();
        if (_agents[name].exists) revert AgentAlreadyExists(name);

        _agents[name] = Agent({
            owner: msg.sender,
            walletAddress: walletAddress,
            endpoint: endpoint,
            metadataURI: metadataURI,
            ensName: ensName,
            status: AgentStatus.Active,
            totalQueries: 0,
            registeredAt: block.timestamp,
            updatedAt: block.timestamp,
            exists: true
        });

        _ownerAgents[msg.sender].push(name);
        _allAgentNames.push(name);

        unchecked {
            totalAgents++;
        }

        emit AgentRegistered(name, name, msg.sender, walletAddress, endpoint, metadataURI, ensName);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  UPDATES
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Update an existing agent's endpoint and metadata URI
    function updateAgent(
        string calldata name,
        string calldata endpoint,
        string calldata metadataURI
    ) external whenNotPaused onlyAgentOwner(name) {
        _agents[name].endpoint = endpoint;
        _agents[name].metadataURI = metadataURI;
        _agents[name].updatedAt = block.timestamp;

        emit AgentUpdated(name, name, msg.sender, endpoint, metadataURI);
    }

    /// @notice Update the agent's wallet address
    function updateWallet(
        string calldata name,
        address newWallet
    ) external whenNotPaused onlyAgentOwner(name) {
        if (newWallet == address(0)) revert InvalidAddress();
        _agents[name].walletAddress = newWallet;
        _agents[name].updatedAt = block.timestamp;

        emit AgentWalletUpdated(name, name, newWallet);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Pause an agent (temporarily stop queries)
    function pauseAgent(string calldata name) external onlyAgentOwner(name) {
        AgentStatus current = _agents[name].status;
        if (current != AgentStatus.Active) {
            revert InvalidStatusTransition(current, AgentStatus.Paused);
        }
        _agents[name].status = AgentStatus.Paused;
        _agents[name].updatedAt = block.timestamp;
        emit AgentStatusChanged(name, name, current, AgentStatus.Paused);
    }

    /// @notice Reactivate a paused agent
    function activateAgent(string calldata name) external onlyAgentOwner(name) {
        AgentStatus current = _agents[name].status;
        if (current != AgentStatus.Paused) {
            revert InvalidStatusTransition(current, AgentStatus.Active);
        }
        _agents[name].status = AgentStatus.Active;
        _agents[name].updatedAt = block.timestamp;
        emit AgentStatusChanged(name, name, current, AgentStatus.Active);
    }

    /// @notice Permanently decommission an agent (irreversible)
    function decommissionAgent(string calldata name) external onlyAgentOwner(name) {
        AgentStatus current = _agents[name].status;
        if (current == AgentStatus.Decommissioned) {
            revert InvalidStatusTransition(current, AgentStatus.Decommissioned);
        }
        _agents[name].status = AgentStatus.Decommissioned;
        _agents[name].updatedAt = block.timestamp;
        emit AgentStatusChanged(name, name, current, AgentStatus.Decommissioned);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  OWNERSHIP TRANSFER
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Transfer ownership of an agent to a new address
    function transferAgentOwnership(
        string calldata name,
        address newOwner
    ) external whenNotPaused onlyAgentOwner(name) {
        if (newOwner == address(0)) revert InvalidAddress();

        address previousOwner = _agents[name].owner;
        _agents[name].owner = newOwner;
        _agents[name].updatedAt = block.timestamp;

        _removeFromOwnerList(previousOwner, name);
        _ownerAgents[newOwner].push(name);

        emit AgentOwnershipTransferred(name, name, previousOwner, newOwner);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  QUERY TRACKING
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Record a query against an agent
    function recordQuery(string calldata name) external whenNotPaused agentMustExist(name) {
        if (_agents[name].status != AgentStatus.Active) revert AgentNotActive(name);

        unchecked {
            _agents[name].totalQueries++;
            globalQueryCount++;
        }

        emit QueryRecorded(name, name, _agents[name].totalQueries, globalQueryCount);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  ADMIN (Ownable)
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Emergency pause the entire registry (admin only)
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause the registry (admin only)
    function unpause() external onlyOwner {
        _unpause();
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Get full agent details by name
    function getAgent(string calldata name) external view returns (Agent memory) {
        return _agents[name];
    }

    /// @notice Check if an agent name is available
    function isNameAvailable(string calldata name) external view returns (bool) {
        return !_agents[name].exists;
    }

    /// @notice Get all agent names owned by an address
    function getOwnerAgents(address owner_) external view returns (string[] memory) {
        return _ownerAgents[owner_];
    }

    /// @notice Get owner agent count
    function getOwnerAgentCount(address owner_) external view returns (uint256) {
        return _ownerAgents[owner_].length;
    }

    /// @notice Get all registered agent names (paginated)
    /// @param offset Starting index
    /// @param limit Max number of names to return
    function getAllAgents(uint256 offset, uint256 limit) external view returns (string[] memory) {
        uint256 total = _allAgentNames.length;
        if (offset >= total) {
            return new string[](0);
        }

        uint256 end = offset + limit;
        if (end > total) end = total;

        string[] memory result = new string[](end - offset);
        for (uint256 i = offset; i < end;) {
            result[i - offset] = _allAgentNames[i];
            unchecked { ++i; }
        }
        return result;
    }

    /// @notice Get the total number of registered agent names
    function getAllAgentsCount() external view returns (uint256) {
        return _allAgentNames.length;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  INTERNAL
    // ═══════════════════════════════════════════════════════════════════════

    /// @dev Validates agent name: length and [a-z0-9-] characters.
    function _validateName(string calldata name) internal pure {
        bytes memory b = bytes(name);
        uint256 len = b.length;

        if (len < MIN_NAME_LENGTH) revert InvalidName("name too short");
        if (len > MAX_NAME_LENGTH) revert InvalidName("name too long");

        // Basic character validation: [a-z0-9-]
        // Cannot start or end with a hyphen.
        if (b[0] == "-" || b[len - 1] == "-") {
            revert InvalidName("cannot start/end with hyphen");
        }

        for (uint256 i = 0; i < len; i++) {
            bytes1 char = b[i];
            if (
                !(char >= "a" && char <= "z") &&
                !(char >= "0" && char <= "9") &&
                !(char == "-")
            ) {
                revert InvalidName("invalid character");
            }
        }
    }

    /// @dev Internal helper to remove a name from an owner's dynamic list
    function _removeFromOwnerList(address owner_, string memory name) internal {
        string[] storage list = _ownerAgents[owner_];
        uint256 len = list.length;
        for (uint256 i = 0; i < len; i++) {
            if (keccak256(bytes(list[i])) == keccak256(bytes(name))) {
                // Swap with last element and pop
                list[i] = list[len - 1];
                list.pop();
                break;
            }
        }
    }
}
