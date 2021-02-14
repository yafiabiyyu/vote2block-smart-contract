// Penyelenggara Testing
const { expect } = require('chain');
const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { keccak256 } = require('web3-utils');

// Load Penyelenggara json file
const Penyelenggara = artifacts.require('Penyelenggara');


// Deklarasi Contract testing
contract('Penyelenggara', accounts => {
    const DEFAULT_ADMIN_PETUGAS = keccak256("DEFAULT_ADMIN_PETUGAS");
    const DEFAULT_ROLE_PETUGAS = keccak256("DEFAULT_ROLE_PETUGAS");
    const ketuaAddress = accounts[0];
    const adminPetugasAddress = accounts[1];
    const petugas1Address = accounts[2];
    const akunLain = accounts[4]


    beforeEach(async function () {
        this.pn = await Penyelenggara.new(
            ketuaAddress,
            { from: accounts[0] }
        );
    });

    describe('Ketua Penyelenggara Test Case', function () {

        it('Ketua menambahkan admin petugas kedalam smart-contract', async function () {
            const txHash = await this.pn.setAdminPetugasAddress(
                adminPetugasAddress,
                { from: ketuaAddress }
            );
            expectEvent(
                txHash,
                'RoleGranted',
                {
                    role: DEFAULT_ADMIN_PETUGAS,
                    account: adminPetugasAddress,
                    sender: ketuaAddress
                }
            )
        });

        it('Pengguna lain gagal menambahkan admin petugas kedalam smart-contract', async function () {
            await expectRevert(
                this.pn.setAdminPetugasAddress(
                    adminPetugasAddress,
                    {from:akunLain}
                ),
                'Terbatas untuk ketua'
            );
        });

        it('Ketua menghapus admin petugas dari smart-contract', async function() {
            // await this.pn.setAdminPetugasAddress(adminPetugasAddress, {from:ketuaAddress});
            const txHash = await this.pn.removeAdminPetugasAddress(
                adminPetugasAddress,
                {from:ketuaAddress}
            );
            expectEvent(
                txHash,
                'RoleRevoked',
                {
                    role:DEFAULT_ADMIN_PETUGAS,
                    account:adminPetugasAddress,
                    sender:ketuaAddress
                }
            );
        });

        it('Pengguna lain gagal menghapus admin petugas dari smart-contract', async function() {
            await expectRevert(
                this.pn.removeAdminPetugasAddress(
                    adminPetugasAddress,
                    {from:akunLain}
                ),
                'Terbatas untuk ketua'
            );
        });
    });

    describe("Admin Petugas Test Case", function() {
        it('Admin petugas menambahkan data petugas baru kedalam smart-contract', async function(){
            await this.pn.setAdminPetugasAddress(adminPetugasAddress,{from:ketuaAddress});
            const txHash = await this.pn.addNewPetugas(
                petugas1Address,
                {from:adminPetugasAddress}
            );
            expectEvent(
                txHash,
                'RoleGranted',
                {
                    role:DEFAULT_ROLE_PETUGAS,
                    account:petugas1Address,
                    sender:adminPetugasAddress
                }
            );
        });

        it('Pengguna lain gagal menambahkan admin kedalam smart-contract', async function(){
            expectRevert(
                this.pn.addNewPetugas(
                    petugas1Address,
                    {from:akunLain}
                ),
                "Terbatas untuk admin petugas"
            )
        });

        it('Admin petugas menghapus petugas dari smart-contract', async function() {
            await this.pn.setAdminPetugasAddress(adminPetugasAddress,{from:ketuaAddress});
            const txHash = await this.pn.removePetugas(
                petugas1Address,
                {from:adminPetugasAddress}
            );
            expectEvent(
                txHash,
                'RoleRevoked',
                {
                    role:DEFAULT_ROLE_PETUGAS,
                    account:petugas1Address,
                    sender:adminPetugasAddress
                }
            )
        });

        it('Pengguna lain gagal menghapus petugas dari smart-contract', async function(){
            expectRevert(
                this.pn.removePetugas(
                    petugas1Address,
                    {from:akunLain}
                ),
                'Terbatas untuk admin petugas'
            )
        });
    });
});