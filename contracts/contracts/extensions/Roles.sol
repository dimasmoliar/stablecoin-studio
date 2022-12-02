// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./Interfaces/IRoles.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

abstract contract Roles is IRoles, AccessControlUpgradeable {
        
    /**
    * @dev Role that allows to mint token
    * 
    * keccak_256("CASHIN_ROLE")
    */ 
    bytes32 public constant CASHIN_ROLE = 0x53300d27a2268d3ff3ecb0ec8e628321ecfba1a08aed8b817e8acf589a52d25c;

    /**
    * @dev Role that allows to burn token
    * 
    * keccak_256("BURN_ROLE")
    */ 
    bytes32 public constant BURN_ROLE = 0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22;

    /**
    * @dev Role that allows to wipe token
    * 
    * keccak_256("WIPE_ROLE")
    */ 
    bytes32 public constant WIPE_ROLE = 0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3;
    
    /**
    * @dev Role that allows to rescue both tokens and hbar
    * 
    * keccak256("RESCUE_ROLE");
    */ 
    bytes32 public constant RESCUE_ROLE = 0x43f433f336cda92fbbe5bfbdd344a9fd79b2ef138cd6e6fc49d55e2f54e1d99a;

    /**
    * @dev Role that allows to pause the token
    * 
    * keccak256("PAUSE_ROLE");
    */ 
    bytes32 public constant PAUSE_ROLE = 0x139c2898040ef16910dc9f44dc697df79363da767d8bc92f2e310312b816e46d;

    /**
    * @dev Role that allows to pause the token
    * 
    * keccak256("FREEZE_ROLE");
    */ 
    bytes32 public constant FREEZE_ROLE = 0x5789b43a60de35bcedee40618ae90979bab7d1315fd4b079234241bdab19936d;

    /**
    * @dev Role that allows to pause the token
    * 
    * keccak256("DELETE_ROLE");
    */ 
    bytes32 public constant DELETE_ROLE = 0x2b73f0f98ad60ca619bbdee4bcd175da1127db86346339f8b718e3f8b4a006e2;

    /**
    * @dev Chain to include in array positions for roles don't available for an account
    * 
    * keccak256("WITHOUT_ROLE");
    */ 
    bytes32 private constant WITHOUT_ROLE = 0xe11b25922c3ff9f0f0a34f0b8929ac96a1f215b99dcb08c2891c220cf3a7e8cc;

    /**
    * @dev Array containing all roles
    *
    */
    bytes32[] private ROLES;

    function roles_init() 
        internal
        onlyInitializing
    {
        __AccessControl_init();
        ROLES.push(DEFAULT_ADMIN_ROLE);
        ROLES.push(CASHIN_ROLE);
        ROLES.push(BURN_ROLE);
        ROLES.push(WIPE_ROLE);
        ROLES.push(RESCUE_ROLE);
        ROLES.push(PAUSE_ROLE);
        ROLES.push(FREEZE_ROLE);
        ROLES.push(DELETE_ROLE);        
    }

    /**
     * @dev Returns an array of roles the account currently has
     *
     * @param account The account address
     * @return bytes32[] The array containing the roles
     */
    function getRoles(address account)
        external
        view
    returns (bytes32[] memory)
    {
        bytes32[] memory roles = new bytes32[](ROLES.length);

        for(uint i=0; i < ROLES.length; i++){
            roles[i] = hasRole(ROLES[i], account) ? ROLES[i] : WITHOUT_ROLE;
        }
        return (roles);
    }

    function getRoleId(roleName role) 
        external 
        view 
    returns(bytes32)
    {
        return _getRoleId(role);
    }

    function _getRoleId(roleName role) 
        internal 
        view 
    returns(bytes32)
    {
        return ROLES[uint256(role)];
    }
}