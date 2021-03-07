const { expect } = require('chain');
const { constants, expectEvent, expectRevert} = require(
  '@openzeppelin/test-helpers'
);
const { keccak256, BN } = require('web3-utils');

//load contract file
const Vote2Block = artifacts.require('Vote2Block');

//Deklarasi contract Test
contract('Vote2Block', accounts => {
  //setup 32 bytes data
  const DEFAULT_ADMIN_PETUGAS = keccak256(
    "DEFAULT_ADMIN_PETUGAS"
  );
  const DEFAULT_PETUGAS_ROLE = keccak256(
    "DEFAULT_PETUGAS_ROLE"
  );

  //accounts setup 
  const ketuaPenyelenggara = accounts[1];
  const adminPetugas = accounts[2];
  const petugas1 = accounts[3];
  const petugas2 = accounts[4];
  const pemilih1 = accounts[5];
  const pemilih2 = accounts[6];
  const pemilih3 = accounts[7];
  const pemilih4 = accounts[8];
  const pemilih5 = accounts[9];

  beforeEach(async function(){
    this.vote2block = await Vote2Block.new(
      ketuaPenyelenggara,
      {from:accounts[0]}
    );
  });

  describe("Ketua Penyelenggara TestCase", function() {
    it("Ketua Penyelenggara menambahkan admin petugas kedalam smart-contract", async function(){
      const txHash = await this.vote2block.addAdminPetugas(
        adminPetugas,
        {from:ketuaPenyelenggara}
      );
      expectEvent(
        txHash,
        'RoleGranted',
        {
          role:DEFAULT_ADMIN_PETUGAS,
          account:adminPetugas,
          sender:ketuaPenyelenggara
        }
      );
    });
    it("Ketua penyelenggara menyiapkan tanggal dan waktu pelaksanaan pendaftaran dan voting", async function(){
      const startRegisterKandidatPemilih = await new Date(
        Date.UTC('2021','02','27','10','10','00')
      );
      const finisRegisterKandidatPemilih = await new Date(
        Date.UTC('2021','02','27','10','30','00')
      );

      const startVotingEvent = await new Date(
        Date.UTC('2021','02','27','09','30','00')
      );
      const finisVotingEvent = await new Date(
        Date.UTC('2021','02','27','12','30','00')
      );

      //Convert to unix timestamp
      const StartRegister = startRegisterKandidatPemilih.getTime()/1000;
      const finisRegister = finisRegisterKandidatPemilih.getTime()/1000;
      const startVoting = startVotingEvent.getTime()/1000;
      const finisVoting = finisVotingEvent.getTime()/1000;

      const txHash = await this.vote2block.setVotingTimestampEvent(
        StartRegister,
        finisRegister,
        startVoting,
        finisVoting,
        {from:ketuaPenyelenggara}
      );
    });
  });
  
  describe("Admin Petugas Test Case", function() {
    it("Admin Petugas berhasil menambahkan petugas kedalam smart-contract", async function() {
      await this.vote2block.addAdminPetugas(adminPetugas,{from:ketuaPenyelenggara});
      const txHash = await this.vote2block.addPetugas(
        petugas2,
        {from:adminPetugas}
      );
      expectEvent(
        txHash,
        'RoleGranted',
        {
          role:DEFAULT_PETUGAS_ROLE,
          account:petugas2,
          sender:adminPetugas
        }
      );
    });
    it("Admin Petugas berhasil menghapus petugas dari smart-contract", async function() {
      await this.vote2block.addAdminPetugas(adminPetugas,{from:ketuaPenyelenggara});
      const txHash = await this.vote2block.removePetugas(
        petugas1,
        {from:adminPetugas}
      );
      expectEvent(
        txHash,
        'RoleRevoked',
        {
          role:DEFAULT_PETUGAS_ROLE,
          account:petugas1,
          sender:adminPetugas
        }
      );
    });
  });
  describe("Petugas Test Case", function(){
    it("Petugas berhasil menambahkan pemilih kedalam smart-contract", async function(){
      const startRegisterpendaftar = await new Date(
        Date.UTC('2021','03','02','09','00','00')
      );
      const finisRegisterpendaftar = await new Date(
        Date.UTC('2021','03','02','10','30','00')
      );
      const startPemilihan = await new Date(
        Date.UTC('2021','03','02','11','00','00')
      );
      const finisPemilihan = await new Date(
        Date.UTC('2021','03','02','00','30','00')
      );
      const register = startRegisterpendaftar.getTime()/1000;
      const finisregister = finisRegisterpendaftar.getTime()/1000;
      const voting = startPemilihan.getTime()/1000;
      const finisvoting = finisPemilihan.getTime()/1000;
      await this.vote2block.setVotingTimestampEvent(
        register,
        finisregister,
        voting,
        finisvoting,
        {from:ketuaPenyelenggara}
      );
      await this.vote2block.addAdminPetugas(adminPetugas,{from:ketuaPenyelenggara});
      await this.vote2block.addPetugas(petugas1,{from:adminPetugas});
      const liveTimestamp = await new Date('2021','03','02','09','10','00');
      const livetimestamp = liveTimestamp.getTime()/1000;
      var pemilihStatus = new BN(1);
      const txHash = await this.vote2block.RegisterPemilih(
        pemilih1,
        livetimestamp,
        {from:petugas1}
      );
      expectEvent(
        txHash,
        'NewPemilihRegister',
        {
          _pemilihAddress: pemilih1,
          _statusHakPilih: pemilihStatus,
          _statusVoting:false
        }
      );
    });
  });
});
