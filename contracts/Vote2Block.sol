// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./Penyelenggara.sol";

contract Vote2Block is Penyelenggara {
    
    // event yang ada di contract
    event TimestampRegisterKandidatPemilihSet(
        uint256 _eventStart,
        uint256 _eventFinish,
        address _sender
    );
    
    event TimestampVotingSet(
        uint256 _eventStart,
        uint256 _eventFinish,
        address _sender
    );
    
    event NewKandidatRegister (
        uint256 _kandidatID,
        uint256 _totalVote,
        bytes32 _kandidatName,
        address _sender
    );
    
    event NewPemilihRegister(
        address pemilihAddress,
        uint256 hakPilihStatus,
        address adminRegister
    );
    
    // type data struct VotingTimestamp
    // untuk menyimpan seluh data waktu selama proses voting
    struct VotingTimestamp {
        // setup unix timestamp for register kandidat dan pemilh
        uint256  startRegisterKandidatPemilihTimestamp;
        uint256  finisRegisterKandidatPemilhTimestamp;
        
        // setup unix timestamp for voting process;
        uint256  startVotingProccessTimestamp;
        uint256  finisVotingProcessTimestamp;
    }
    VotingTimestamp private vt;
    
    struct Kandidat {
        uint256 totalVote;
        bytes32 kandidatName;
    }
    
    struct Pemilih {
        uint256 statusHakPilih;
        uint256 pilihanKandidat;
        bool statusVote;
    }
    
    // mapping ddata
    mapping(address => Pemilih) private pemilih;
    mapping(uint256 => Kandidat) private kandidat;
    
    constructor(address _ketuaAddress) {
        _setupRole(DEFAULT_ADMIN_ROLE,_ketuaAddress);
        _setRoleAdmin(DEFAULT_ROLE_PETUGAS,DEFAULT_ADMIN_PETUGAS);
    }
    
    modifier onlyOwner {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender),"Terbatas hanya untuk ketua");
        _;
    }
    
    modifier onlyAdminPetugas {
        require(hasRole(DEFAULT_ADMIN_PETUGAS, msg.sender));
        _;
    }
    
    modifier onlyPetugas {
        require(hasRole(DEFAULT_ROLE_PETUGAS, msg.sender));
        _;
    }
    
    modifier onlyRegisterStart(uint256 _liveTimestamp) {

        require(
            _liveTimestamp <= vt.startRegisterKandidatPemilihTimestamp
            && _liveTimestamp >= vt.finisRegisterKandidatPemilhTimestamp,
            "Waktu pendaftaran belum di mulai atau telah habis masa waktunya");
        _;
    }
    
    modifier onlyPemilh {
        require(pemilih[msg.sender].statusHakPilih == 1);
        _;
    }
    
    // start set admin petugas dan petugas
    function AddAdminPetugas(address _AdminPetugasAddress) public onlyOwner {
        setAdminPetugasAddress(_AdminPetugasAddress);
    }
    
    function RemoveAdminPetugas(address _AdminPetugasAddress) public onlyOwner {
        removeAdminPetugasAddress(_AdminPetugasAddress);
    }
    
    function AddPetugas(address _PetugasAddress) public onlyAdminPetugas {
        addNewPetugas(_PetugasAddress);
    }
    
    function RemovePetugas(address _PetugasAddress) public onlyAdminPetugas {
        removePetugas(_PetugasAddress);
    }
    // finish set admin petugas dan petugas
    
    // start set waktu dalam proses pemilihan
    function setTimestamPendaftaranterKandidatPemilih(
        uint256 _timestampPendaftaranMulai,
        uint256 _timestampPendaftaranSelesai
    ) public onlyOwner {
        vt.startRegisterKandidatPemilihTimestamp = _timestampPendaftaranMulai;
        vt.finisRegisterKandidatPemilhTimestamp = _timestampPendaftaranSelesai;
        emit TimestampRegisterKandidatPemilihSet(_timestampPendaftaranMulai, _timestampPendaftaranSelesai, msg.sender);
    }
    
    function setTimestampProsesVoting(
        uint256 _timestampVotingMulai,
        uint256 _timestampVotingSelesai
    ) public onlyOwner {
        vt.startVotingProccessTimestamp = _timestampVotingMulai;
        vt.finisVotingProcessTimestamp = _timestampVotingSelesai;
        emit TimestampVotingSet(_timestampVotingMulai, _timestampVotingSelesai, msg.sender);
    }
    // finish set waktu dalam proses pemilihan
    
    // start register kandidat dan pemilihan
    function RegisterKandidat(
        uint256 _kandidatID,
        bytes32 _kandidatName,
        uint256 _liveTimestamp
    ) public onlyPetugas onlyRegisterStart(_liveTimestamp) {
        kandidat[_kandidatID] = Kandidat(0, _kandidatName);
        emit NewKandidatRegister(_kandidatID, 0, _kandidatName, msg.sender);
    }
    
    function RegisterPemilih(address _pemilihAddress,uint256 _liveTimestamp) public onlyPetugas onlyRegisterStart(_liveTimestamp) {
        require(!pemilih[_pemilihAddress].statusVote,"Pemilh telah memberikan hak suara");
        require(pemilih[_pemilihAddress].statusHakPilih == 0);
        // memberikan hak memilih kapada pemilih
        pemilih[_pemilihAddress].statusHakPilih = 1;
        emit NewPemilihRegister(_pemilihAddress, 1, msg.sender);
    }
    // finish register kandidat dna pemilih
}