const { expect } = require('chain');
const { constants, expectEvent, expectRevert } = require(
  '@openzeppelin/test-helpers'
);
const { keccak256 } = require('web3-utils');

//load constract file
const Vote2Block = artifacts.require('Vote2Block');


//Deklarasi contract
contract('Vote2Block', accounts => {
  //stup bytes32 data role
  const DEFAULT_ADMIN_PETUGAS = keccak256(
    "DEFAULT_ADMIN_PETUGAS"
  );

  const DEFAULT_PETUGAS_ROLE = keccak256(
    "DEFAULT_PETUGAS_ROLE"
  );

  //setup accounts 
  const ketuaPenyelenggara = accounts[1];
  const adminPetugas = accounts[2];
  const petugas1 = accounts[3]
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

  describe("Ketua Penyelenggara Test Case", function(){
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
    it("Ketua penyelenggara menghapus admin petugas dari smart-contract", async function(){
      const txHash = await this.vote2block.removeAdminPetugas(
        adminPetugas,
        {from:ketuaPenyelenggara}
      );
      expectEvent(
        txHash,
        'RoleRevoked',
        {
          role:DEFAULT_ADMIN_PETUGAS,
          account:adminPetugas,
          sender:ketuaPenyelenggara
        }
      );
    });
    it("Pengguna lain selain ketua penyelenggara gagal menambahkan admin petugas", async function(){
      await expectRevert(
        this.vote2block.addAdminPetugas(
          adminPetugas,
          {from:pemilih1}
        ),
        "Terbatas hanya untuk ketua penyelenggara"
      );
    });
    it("Pengguna lain selain ketua penyelenggara gagal menghapus admin petugas", async function(){
      await expectRevert(
        this.vote2block.removeAdminPetugas(
          adminPetugas,
          {from:petugas1}
        ),
        "Terbatas hanya untuk ketua penyelenggara"
      );
    });
  });
});
