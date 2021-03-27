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
    event VotingTimeSet(
        uint256 _registerStart,
        uint256 _registerFinis,
        uint256 _votingStart,
        uint256 _votingFinis
    );
    event RegisterPetugas(address _petugasAddress, address sender);
    event RemovePetugas(address _petugasAddress, address sender);
    event RegisterKandidat(
        uint256 _kandidatID, 
        uint256 _totalVote, 
        bytes32 _kandidatName, 
        address sender
    );
    event RegisterPemilih(address _pemilihAddress, uint256 _statusHakpilih, bool statusVoting);

    // modifier list
    modifier onlyRegisterStart(uint256 _liveTimestamp) {
        VotingTimeStamp memory vt;
        require(
            _liveTimestamp > vt.startRegisterTime && _liveTimestamp > vt.finishRegisterTime,
            "Waktu register belum di mulai atau sudah berkahir"
        );
        _;
    }
    
    modifier onlyVotingStart(uint256 _liveTimestamp) {
      VotingTimeStamp memory vt;
      require(
        _liveTimestamp > vt.startVotingTime && _liveTimestamp > vt.finishVotingTime
      );
      _;
    }
    // struct data list
    struct VotingTimeStamp {
        uint256 startRegisterTime;
        uint256 finishRegisterTime;
        uint256 startVotingTime;
        uint256 finishVotingTime;
    }

    struct Kandidat {
        uint256 kandidatID;
        uint256 totalVote;
        bytes32 kandidatName;
    }

    struct Pemilih {
        uint256 statusHakPilih;
        uint256 kandidatPilihan;
        bool statusVoting;
    }


    constructor(address _ketuaPenyelenggara) {
        ketuaPenyelenggara = _ketuaPenyelenggara;
    }
    Kandidat[] public kandidat;
    mapping(address => Pemilih) public pemilih;

    // Ketua
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

    function setVotingTimestampEvent(
        uint256 _startRegisterTimeStamp,
        uint256 _finisRegisterTimeStamp,
        uint256 _startVotingEvent,
        uint256 _finisVotingEvent,
        bytes memory signature
    ) public {
        //pass
        bytes32 message = prefixed(keccak256(abi.encodePacked(
            _startRegisterTimeStamp,
            _finisRegisterTimeStamp,
            _startVotingEvent,
            _finisVotingEvent
        )));
        address recoverAddress = recoverSigner(message, signature);
        require(recoverAddress == ketuaPenyelenggara);
        VotingTimeStamp(
            _startRegisterTimeStamp,
            _finisRegisterTimeStamp,
            _startVotingEvent,
            _finisVotingEvent
        );
        emit VotingTimeSet(
            _startRegisterTimeStamp,
            _finisRegisterTimeStamp,
            _startVotingEvent,
            _finisVotingEvent
        );
    }

    // Admin Petugas
    function addPetugas(address _petugasAddress, uint256 nonce, bytes memory signature) public {
        bytes32 message = prefixed(keccak256(abi.encodePacked(_petugasAddress, nonce)));
        address recoverAddress = recoverSigner(message, signature);
        require(AdminPetugas[recoverAddress]);
        Petugas[_petugasAddress] = true;
        emit RegisterPetugas(_petugasAddress, recoverAddress);
    }

    function removePetugas(address _petugasAddress, uint256 nonce, bytes memory signature) public {
        bytes32 message = prefixed(keccak256(abi.encodePacked(_petugasAddress, nonce)));
        address recoverAddress = recoverSigner(message, signature);
        require(AdminPetugas[recoverAddress]);
        Petugas[_petugasAddress] = false;
        emit RemovePetugas(_petugasAddress, recoverAddress);
    }

    // petugas
    function registerKandidat(
        uint256 _kandidatId,
        uint256 nonce,
        uint256 _liveTimestamp,
        bytes32 _kandidatName,
        bytes memory signature
    ) public onlyRegisterStart(_liveTimestamp){
        bytes32 message = prefixed(keccak256(abi.encodePacked(
            _kandidatId,
            _kandidatName,
            nonce
        )));
        address recoverAddress = recoverSigner(message, signature);
        require(Petugas[recoverAddress]);
        kandidat.push(Kandidat({
            kandidatID:_kandidatId,
            totalVote:0,
            kandidatName:_kandidatName
        }));
        emit RegisterKandidat(
            _kandidatId,
            0,
            _kandidatName,
            recoverAddress
        );
    }

    function registerPemilih(
        address _pemilihAddress,
        uint256 nonce,
        uint256 _liveTimestamp,
        bytes memory signature
    ) public onlyRegisterStart(_liveTimestamp){
            bytes32 message = prefixed(
              keccak256(abi.encodePacked(_pemilihAddress, nonce))
            );
            address recoverAddress = recoverSigner(message, signature);
            require(Petugas[recoverAddress]);
            require(
              !pemilih[_pemilihAddress].statusVoting,
              "Pemilih sudah memberikan hak pilihnya"
            );
            require(
              pemilih[_pemilihAddress].statusHakPilih == 0,
              "Pemilih belum memiliki hak pilih"
            );
            pemilih[_pemilihAddress].statusHakPilih = 1;
            pemilih[_pemilihAddress].statusVoting = false;
            emit RegisterPemilih(
              _pemilihAddress,
              1,
              false
            );
        }

    function Voting(
      uint256 _kandidatID,
      uint256 nonce,
      uint256 _liveTimestamp,
      bytes memory signature
    ) public onlyVotingStart(_liveTimestamp) {
      bytes32 message = prefixed(
        keccak256(abi.encodePacked(_kandidatID,nonce))
      );
      address recoverAddress = recoverSigner(message, signature);
      Pemilih storage pm = pemilih[recoverAddress];
      require(
        pm.statusHakPilih != 0,
        "Pemilih tidak memiliki hak pilih"
      );
      require(
        !pm.statusVoting,
        "Pemilih sudah menggunakan hak pilihnya"
      );
      pm.statusVoting = true;
      pm.kandidatPilihan = _kandidatID;
      uint indexKandidat = _kandidatID - 1;
      kandidat[indexKandidat].totalVote += pm.statusHakPilih;
    }

    function _hitungTotalSuara() internal view returns(uint256 totalSuara_) {
      uint totalSuaraKandidat = 0;
      for (uint p = 0; p < kandidat.length; p++) {
        totalSuaraKandidat = kandidat[p].totalVote;
        totalSuara_ = p;
      }
    }
  
    function kandidatTerpilih() public view returns(bytes32 kandidatName_) {
      kandidatName_ = kandidat[_hitungTotalSuara()].kandidatName;
    }

    function getTotalKandidat() public view returns(uint256) {
      return kandidat.length;
    }

    function getKandidatData(uint256 kandidatIndex) public view returns(uint256, uint256, bytes32) {
      return(kandidat[kandidatIndex].kandidatID,kandidat[kandidatIndex].totalVote,kandidat[kandidatIndex].kandidatName);
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
