// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Penyelenggara is AccessControl {

    bytes32 public constant DEFAULT_ROLE_PETUGAS = keccak256("DEFAULT_ROLE_PETUGAS");
    bytes32 public constant DEFAULT_ADMIN_PETUGAS = keccak256("DEFAULT_ADMIN_PETUGAS");

    constructor(address _ketuaAddress) {
        _setupRole(DEFAULT_ADMIN_ROLE, _ketuaAddress);
        _setRoleAdmin(DEFAULT_ROLE_PETUGAS, DEFAULT_ADMIN_PETUGAS);
    }

    modifier onlyOwner {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender),"Terbatas untuk ketua");
        _;
    }
    
    modifier onlyAdminPetugas {
        require(hasRole(DEFAULT_ADMIN_PETUGAS, msg.sender), "Terbatas untuk admin petugas");
        _;
    }
    
    modifier onlyPetugas {
        require(hasRole(DEFAULT_ROLE_PETUGAS, msg.sender), "Terbatas hanya untuk petugas");
        _;
    }
    
    function setAdminPetugasAddress(address _adminPetugasAddress) public onlyOwner {
        grantRole(DEFAULT_ADMIN_PETUGAS, _adminPetugasAddress);
        emit RoleGranted(DEFAULT_ADMIN_PETUGAS, _adminPetugasAddress, msg.sender);
    }
    
    function removeAdminPetugasAddress(address _adminPetugasAddress) public onlyOwner {
        revokeRole(DEFAULT_ADMIN_PETUGAS, _adminPetugasAddress);
        emit RoleRevoked(DEFAULT_ADMIN_PETUGAS, _adminPetugasAddress, msg.sender);
    }
    
    function addNewPetugas(address _petugasAddress) public onlyAdminPetugas {
        grantRole(DEFAULT_ROLE_PETUGAS, _petugasAddress);
        emit RoleGranted(DEFAULT_ROLE_PETUGAS, _petugasAddress, msg.sender);
    }
    
    function removePetugas(address _petugasAddress) public onlyAdminPetugas {
        revokeRole(DEFAULT_ROLE_PETUGAS, _petugasAddress);
        emit RoleRevoked(DEFAULT_ROLE_PETUGAS, _petugasAddress, msg.sender);
    }
}