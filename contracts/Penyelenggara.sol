// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Penyelenggara is AccessControl {
    
    bytes32 internal constant DEFAULT_ROLE_PETUGAS = keccak256("DEFAULT_ROLE_PETUGAS");
    bytes32 internal constant DEFAULT_ADMIN_PETUGAS = keccak256("DEFAULT_ADMIN_PETUGAS");
    
    function setAdminPetugasAddress(address _adminPetugasAddress) internal {
        grantRole(DEFAULT_ADMIN_PETUGAS, _adminPetugasAddress);
        emit RoleGranted(DEFAULT_ADMIN_PETUGAS, _adminPetugasAddress, msg.sender);
    }
    
    function removeAdminPetugasAddress(address _adminPetugasAddress) internal {
        revokeRole(DEFAULT_ADMIN_PETUGAS, _adminPetugasAddress);
        emit RoleRevoked(DEFAULT_ADMIN_PETUGAS, _adminPetugasAddress, msg.sender);
    }
    
    function addNewPetugas(address _petugasAddress) internal {
        grantRole(DEFAULT_ROLE_PETUGAS, _petugasAddress);
        emit RoleGranted(DEFAULT_ROLE_PETUGAS, _petugasAddress, msg.sender);
    }
    
    function removePetugas(address _petugasAddress) internal {
        revokeRole(DEFAULT_ROLE_PETUGAS, _petugasAddress);
        emit RoleRevoked(DEFAULT_ROLE_PETUGAS, _petugasAddress, msg.sender);
    }
}