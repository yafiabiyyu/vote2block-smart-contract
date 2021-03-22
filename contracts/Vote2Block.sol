// SPDX-License-Identifier:MIT
pragma solidity 0.7.0;

contract Vote2Block {

    // deklarasi akses pengguna di dalam smart-contract
    address ketuaPenyelenggara;
    mapping(address => bool) public AdminPetugas;
    mapping(address => bool) public Petugas;

    // deklarasi event di dalam smart-contract
    event RegisterAdminPetugas(address _adminAddress, address sender);
    event RemoveAdminPetugas(address _adminAddress, address sender);

    constructor(address _ketuaPenyelenggara) {
        ketuaPenyelenggara = _ketuaPenyelenggara;
    }

    // AdminPetugas Handle
    function addAdminPetugas(address _adminAddress, uint256 nonce, bytes memory signature) public {
        bytes32 message = prefixed(keccak256(abi.encodePacked(_adminAddress, nonce)));
        address recoverAddress = recoverSigner(message, signature);
        require(recoverAddress == ketuaPenyelenggara,"Hanya ketua penyelenggara yang dapat menambahkan admin");
        AdminPetugas[_adminAddress] = true;
        emit RegisterAdminPetugas(_adminAddress, recoverAddress);
    }

    function removeAdminPetugas(address _adminAddress, uint256 nonce, bytes memory signature) public {
        bytes32 message = prefixed(keccak256(abi.encodePacked(_adminAddress, nonce)));
        address recoverAddress = recoverSigner(message, signature);
        require(recoverAddress == ketuaPenyelenggara,"Hanya ketua penyelenggara yang dapat menghapus admin");
        AdminPetugas[_adminAddress] = false;
        emit RemoveAdminPetugas(_adminAddress, recoverAddress);
    }

    // Handle signature data dari user
    function splitSignature(bytes memory signature) internal pure returns(
        uint8 v,
        bytes32 r,
        bytes32 s
    ) {
        require(signature.length == 65);
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        return (v, r, s);
    }

    function recoverSigner(bytes32 message, bytes memory signature) internal pure returns(address) {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        return ecrecover(message, v, r, s);
    }

    function prefixed(bytes32 hash) internal pure returns(bytes32) {
        return keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );
    }
}