// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Vote2Block is AccessControl {
    // Event list di contract
    event TimestampSetting(
        uint256 _registerStart,
        uint256 _registerFinis,
        uint256 _votingStart,
        uint256 _votingFinis
    );

    event NewKandidatRegister(
        uint256 _kandidatID,
        uint256 _totalVote,
        bytes32 _kandidatName
    );

    event NewPemilihRegister(
        address _pemilihAddress,
        uint256 _statusHakPilih,
        bool _statusVoting
    );

    // Deklarasi role admin petugas dan petugas dengan bytes 32
    bytes32 public constant DEFAULT_ADMIN_PETUGAS = keccak256("DEFAULT_ADMIN_PETUGAS");
    bytes32 public constant DEFAULT_PETUGAS_ROLE = keccak256("DEFAULT_PETUGAS_ROLE");

    constructor(address _ketuaAddress) {
        _setupRole(DEFAULT_ADMIN_ROLE, _ketuaAddress);
        _setRoleAdmin(DEFAULT_PETUGAS_ROLE, DEFAULT_ADMIN_PETUGAS);
    }

    //Modifier yang ada di dalam contract
    modifier onlyOwner {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Terbatas hanya untuk ketua penyelenggara");
        _;
    }

    modifier onlyAdminPetugas {
        require(hasRole(DEFAULT_ADMIN_PETUGAS, msg.sender));
        _;
    }

    modifier onlyPetugas {
        require(hasRole(DEFAULT_PETUGAS_ROLE, msg.sender),"Terbatas hanya untuk petugas");
        _;
    }

    modifier onlyRegisterStart(uint256 _liveTimestamp) {
        VotingTimestampSetting memory vt;
        require(
            _liveTimestamp > vt.startRegisterTimestamp && _liveTimestamp > vt.finisRegisterTimestamp,
            "Waktu pendaftaran telah selesai atau belum di mulai"
        );
        _;
    }

    modifier onlyVotingStart(uint256 _liveTimestamp) {
        VotingTimestampSetting memory vt;
        require(
            _liveTimestamp > vt.startVotingEvent && _liveTimestamp > vt.finisVotingEvent
        );
        _;
    }

    // list struct data 
    struct VotingTimestampSetting {
        uint256 startRegisterTimestamp;
        uint256 finisRegisterTimestamp;

        uint256 startVotingEvent;
        uint256 finisVotingEvent;
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
    
    //menyimpan Pemilih struct untuk setiap address
    mapping(address => Pemilih) public pemilih;

    //dynamic array dari kandidat struct
    Kandidat[] public kandidat;

    //seluruh function penyelenggara
    function addAdminPetugas(address _adminPetugasAddress) public onlyOwner {
        grantRole(DEFAULT_ADMIN_PETUGAS, _adminPetugasAddress);
        emit RoleGranted(DEFAULT_PETUGAS_ROLE, _adminPetugasAddress, msg.sender);
    }

    function removeAdminPetugas(address _adminPetugasAddress) public onlyOwner {
        revokeRole(DEFAULT_ADMIN_PETUGAS, _adminPetugasAddress);
        emit RoleRevoked(DEFAULT_ADMIN_PETUGAS, _adminPetugasAddress, msg.sender);
    }

    function addPetugas(address _petugasAddress) public onlyAdminPetugas {
        grantRole(DEFAULT_PETUGAS_ROLE, _petugasAddress);
        emit RoleGranted(DEFAULT_PETUGAS_ROLE, _petugasAddress,msg.sender);
    }

    function removePetugas(address _petugasAddress) public onlyAdminPetugas {
        revokeRole(DEFAULT_PETUGAS_ROLE, _petugasAddress);
        emit RoleRevoked(DEFAULT_PETUGAS_ROLE, _petugasAddress,msg.sender);
    }
    
    //voting function
    function setVotingTimestampEvent(
        uint256 _startRegisterTimeStamp,
        uint256 _finisRegisterTimeStamp,
        uint256 _startVotingEvent,
        uint256 _finisVotingEvent
    ) public onlyOwner {
        //pass
        VotingTimestampSetting(
            _startRegisterTimeStamp,
            _finisRegisterTimeStamp,
            _startVotingEvent,
            _finisVotingEvent
        );
        emit TimestampSetting(
            _startRegisterTimeStamp,
            _finisRegisterTimeStamp,
            _startVotingEvent,
            _finisVotingEvent
        );
    }

    function RegisterKandidat(
        uint256 _kandidatID,
        uint256 _liveTimestamp,
        bytes32 _kandidatName
    ) public onlyPetugas onlyRegisterStart(_liveTimestamp) {
        kandidat.push(Kandidat({
            kandidatID:_kandidatID,
            totalVote:0,
            kandidatName:_kandidatName
        }));
        emit NewKandidatRegister(
            _kandidatID,
            0,
            _kandidatName
        );
    }

    function RegisterPemilih(
        address _pemilihAddress,
        uint256 _liveTimestamp
    ) public onlyPetugas onlyRegisterStart(_liveTimestamp) {
        require(!pemilih[_pemilihAddress].statusVoting, "Pemilih sudah memberikan hak suara");
        require(pemilih[_pemilihAddress].statusHakPilih == 0, "Pemilih tidak memiliki hak pilih");
        // memberikan hak pilih kepada pemilh 
        pemilih[_pemilihAddress].statusHakPilih = 1;
        pemilih[_pemilihAddress].statusVoting = false;
        emit NewPemilihRegister(
            _pemilihAddress,
            1,
            false
        );
    }

    function Voting(
        uint256 _kandidatID,
        uint256 _liveTimestamp
    ) public onlyVotingStart(_liveTimestamp) {
        Pemilih storage pm = pemilih[msg.sender];
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
        kandidat[_kandidatID].totalVote += pm.statusHakPilih;
    }

    function getKandidat() public view returns(Kandidat[] memory) {
        return kandidat;
    }

    function _perhitunganSuara() private view returns(uint256 totalSuara_) {
        uint totalSuaraKandidat = 0;
        for (uint p = 0; p < kandidat.length; p++) {
            totalSuaraKandidat = kandidat[p].totalVote;
            totalSuara_ = p;
        }
    }

    function kandidatTerpilih() public view returns(bytes32 kandidatName_) {
        kandidatName_ = kandidat[_perhitunganSuara()].kandidatName; 
    }
}
