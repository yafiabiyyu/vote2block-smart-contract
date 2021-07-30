const { web3, accounts } = require("@openzeppelin/test-environment");
const { expectEvent, expectRevert, BN } = require("@openzeppelin/test-helpers");
const { expect, assert } = require("chai");
const { beforeEach } = require("mocha");
// const { before, beforeEach } = require('mocha');
const vote = artifacts.require("Vote2Block");
require("dotenv").config();

contract("Vote2Block", (accounts) => {
    const registerstart = 1627549200;
    const registerfinis = 1627552800;
    const votingstart = 1627556400;
    const votingfinis = 1627560000;

    describe("Contract Deployment", function () {
        it("Contract Address", async function () {
            this.instance = await vote.new("0x012F1Dfb957C87D4B940249652ddd20bC63bE83C");
            assert(this.instance.address !== "");
        });
    });

    describe("Pengaturan Waktu", function () {
        it("Non Admin Menambahkan Data Waktu", async function () {
            this.instance = await vote.new("0x012F1Dfb957C87D4B940249652ddd20bC63bE83C");
            const sig =
                "0x6d72c11880cbf55bb8d1e3118c2595352bdb6635239766b39d8cbac42c6a2c9657579203f7fab80bf4e0599364d0d9dbc6c60b9d3ccb61df27df179ea6dbfb501c";
            await expectRevert(
                this.instance.SetupTimedata(
                    registerstart,
                    registerfinis,
                    votingstart,
                    votingfinis,
                    0,
                    sig
                ),
                "Non Admin Address"
            );
        });
        it("Admin Menambahkan Data Waktu", async function () {
            this.instance = await vote.new("0x012F1Dfb957C87D4B940249652ddd20bC63bE83C");
            const sig =
                "0xfd0ee92d385d6b6c38a52f28a5da275fb742e684788284128c1f164debba43232f18c465c4cda95a22214036f5f9b096d272d6667d946ba2769301a5fc3be3f01b";
            const receipt = await this.instance.SetupTimedata(
                registerstart,
                registerfinis,
                votingstart,
                votingfinis,
                0,
                sig
            );
            expectEvent(receipt, "VotingTime", {
                _registerstart: new BN(registerstart),
                _registerfinis: new BN(registerfinis),
                _votingstart: new BN(votingstart),
                _votingfinis: new BN(votingfinis),
                _ownerAddress: "0x012F1Dfb957C87D4B940249652ddd20bC63bE83C",
            });
        });
    });
    describe("Pendaftaran Kandidat", function () {
        it("Melakukan Pendaftaran Kandidat Sebelum Waktu Dimulai", async function () {
            const sig_time =
                "0xfd0ee92d385d6b6c38a52f28a5da275fb742e684788284128c1f164debba43232f18c465c4cda95a22214036f5f9b096d272d6667d946ba2769301a5fc3be3f01b";
            const sig_register =
                "0x1d74761b6a209a993506e8e12aa27597bc671cdc1753d4da84363f13284b76d9449b996f7d6b460d46c416c07471cf105c69ce766c738ca1a58a366305ec84811c";
            const bytes_name =
                "0x660661ef173d593dd34075616e42618861ee284490dc1a9466cc1a883160e3dd";
            this.instance = await vote.new("0x012F1Dfb957C87D4B940249652ddd20bC63bE83C");
            await this.instance.SetupTimedata(
                registerstart,
                registerfinis,
                votingstart,
                votingfinis,
                0,
                sig_time
            );
            await expectRevert(
                this.instance.KandidatRegister(
                    1,
                    0,
                    1627545600,
                    bytes_name,
                    sig_register
                ),
                "Waktu pendaftaran belum dibuka"
            );
        });
        it("Non Admin Mendaftarkan Kandidat", async function(){
            const sig_time =
                "0x526e9c73acbad04e23461882bb849e3e99ceec1e95214b191fb1e677818a7f4e1430b66772d3a6344e107dc8342cd8cf1e9e6f8e8b5416eb98e14e13bf2e9d991c";
            const sig_register =
                "0x2ee94d2883823ebee357645c58c6478830d7c6f05e58c597ae8c27aae9aee34855b91942d7778261eddf7e0bfaf942e400e07e102fef98072f54e64a13779bdc1c";
            const bytes_name =
                "0x660661ef173d593dd34075616e42618861ee284490dc1a9466cc1a883160e3dd";
            this.instance = await vote.new("0x012F1Dfb957C87D4B940249652ddd20bC63bE83C");
            await this.instance.SetupTimedata(
                1627534800,
                registerfinis,
                votingstart,
                votingfinis,
                0,
                sig_time
            );
            await expectRevert(
                this.instance.KandidatRegister(
                    1,
                    0,
                    1627545600,
                    bytes_name,
                    sig_register
                ),
                "Non Admin Address"
            );
        });
        it("Admin Mendaftarkan Kandidat Setelah Waktu Dimulai", async function(){
            const sig_time = "0x526e9c73acbad04e23461882bb849e3e99ceec1e95214b191fb1e677818a7f4e1430b66772d3a6344e107dc8342cd8cf1e9e6f8e8b5416eb98e14e13bf2e9d991c"
            const sig_register = "0x1d74761b6a209a993506e8e12aa27597bc671cdc1753d4da84363f13284b76d9449b996f7d6b460d46c416c07471cf105c69ce766c738ca1a58a366305ec84811c"
            const bytes_name = "0x660661ef173d593dd34075616e42618861ee284490dc1a9466cc1a883160e3dd"
            this.instance = await vote.new("0x012F1Dfb957C87D4B940249652ddd20bC63bE83C")
            await this.instance.SetupTimedata(
                1627534800,
                registerfinis,
                votingstart,
                votingfinis,
                0,
                sig_time
            );
            const receipt = await this.instance.KandidatRegister(
                1,
                0,
                1627545600,
                bytes_name,
                sig_register
            );
            expectEvent(receipt,"RegisterKandidat",{
                _kandidatID:new BN(1),
                _totalVote:new BN(0),
                _kandidatName:bytes_name,
                _ownerAddress:"0x012F1Dfb957C87D4B940249652ddd20bC63bE83C",
            })
        })
    });

    describe("Pendaftaran Pemilih", function(){
        it("Melakukan Pendaftaran Pemilih Sebelum Waktu Dimulai", async function(){
            const sig_time = "0xfd0ee92d385d6b6c38a52f28a5da275fb742e684788284128c1f164debba43232f18c465c4cda95a22214036f5f9b096d272d6667d946ba2769301a5fc3be3f01b"
            const sig_register = "0x6abb89de11b8d3487af15efda74941359f1f80c6668a626c4d5c71b3f40f9bd31fcbf220321c68d5b427ef6b1308792daf62d43f15e188a7f7021f0a2a56495d1b"
            const livetime = "1627545600"
            const pemilih_address = "0xFabf8979D3A16170ce8a13C1281268fb37e8f55b"
            this.instance = await vote.new("0x012F1Dfb957C87D4B940249652ddd20bC63bE83C")
            await this.instance.SetupTimedata(
                registerstart,
                registerfinis,
                votingstart,
                votingfinis,
                0,
                sig_time
            );
            await expectRevert(
                this.instance.PemilihRegister(
                    pemilih_address,
                    0,
                    livetime,
                    sig_register
                ),
                "Waktu pendaftaran belum dibuka"
            );
        });
        it("Non Admin Mendaftarkan Pemilih", async function(){
            const sig_time = "0x526e9c73acbad04e23461882bb849e3e99ceec1e95214b191fb1e677818a7f4e1430b66772d3a6344e107dc8342cd8cf1e9e6f8e8b5416eb98e14e13bf2e9d991c"
            const sig_register = "0x85ef23f96ea0630d9abafc1ba61c01c249ad34aca138210bccc3af5799801e9f5c3e984fed350244acdeafecd3f7aa6a5ecbd560f461b05797d842ddac185ea51b"
            const pemilih_address = "0xFabf8979D3A16170ce8a13C1281268fb37e8f55b"
            const livetime = 1627545600
            this.instance = await vote.new("0x012F1Dfb957C87D4B940249652ddd20bC63bE83C")
            await this.instance.SetupTimedata(
                1627534800,
                registerfinis,
                votingstart,
                votingfinis,
                0,
                sig_time
            );
            await expectRevert(
                this.instance.PemilihRegister(
                    pemilih_address,
                    0,
                    livetime,
                    sig_register
                ),
                "Non Admin Address"
            );
        });
        it("Melakukan Pendaftaran Pemilih Dengan Address Yang Sama Dua Kali", async function(){
            const sig_time = "0x526e9c73acbad04e23461882bb849e3e99ceec1e95214b191fb1e677818a7f4e1430b66772d3a6344e107dc8342cd8cf1e9e6f8e8b5416eb98e14e13bf2e9d991c"
            const sig_register = "0x6abb89de11b8d3487af15efda74941359f1f80c6668a626c4d5c71b3f40f9bd31fcbf220321c68d5b427ef6b1308792daf62d43f15e188a7f7021f0a2a56495d1b"
            const pemilih_address = "0xFabf8979D3A16170ce8a13C1281268fb37e8f55b"
            const livetime = 1627545600
            this.instance = await vote.new("0x012F1Dfb957C87D4B940249652ddd20bC63bE83C")
            await this.instance.SetupTimedata(
                1627534800,
                registerfinis,
                votingstart,
                votingfinis,
                0,
                sig_time
            );
            await this.instance.PemilihRegister(pemilih_address, 0, livetime, sig_register)
            await expectRevert(
                this.instance.PemilihRegister(
                    pemilih_address,
                    0,
                    livetime,
                    sig_register
                ),
                "Pemilih telah memiliki hak pilih"
            );
        });
        it("Admin Mendaftarkan Pemilih", async function(){
            const sig_time = "0x526e9c73acbad04e23461882bb849e3e99ceec1e95214b191fb1e677818a7f4e1430b66772d3a6344e107dc8342cd8cf1e9e6f8e8b5416eb98e14e13bf2e9d991c"
            const sig_register = "0x6abb89de11b8d3487af15efda74941359f1f80c6668a626c4d5c71b3f40f9bd31fcbf220321c68d5b427ef6b1308792daf62d43f15e188a7f7021f0a2a56495d1b"
            const pemilih_address = "0xFabf8979D3A16170ce8a13C1281268fb37e8f55b"
            const livetime = 1627545600
            this.instance = await vote.new("0x012F1Dfb957C87D4B940249652ddd20bC63bE83C")
            await this.instance.SetupTimedata(
                1627534800,
                registerfinis,
                votingstart,
                votingfinis,
                0,
                sig_time
            );
            const receipt =  await this.instance.PemilihRegister(pemilih_address, 0, livetime, sig_register)
            expectEvent(receipt, "RegisterPemilih",{
                _pemilihAddress:pemilih_address,
                _statusHakPilih:new BN(1),
                statusVoting:false,
                _ownerAddress:"0x012F1Dfb957C87D4B940249652ddd20bC63bE83C",
            });
        });
    });
    describe("Pemilihan", function(){
        it("Melakukan Pemilihan Disaat Waktu Pendaftaran Belum Berakhir", async function(){
            this.instance = await vote.new("0x012F1Dfb957C87D4B940249652ddd20bC63bE83C");
            const livetime = 1627545600

            // Pengaturan waktu 
            const sig_time = "0x5dd1373ada66cf5bb2dd7d10dea7db69e8695a6d3d6936fa2d6600357a75dfbd65a4345cbfcc7280489786b87fb4b9720d9328965c3fb2dbe9ee02616eabbaa91c"
            await this.instance.SetupTimedata(1627542000,1627549200,votingstart,votingfinis,0,sig_time);

            // Pendaftaran Kandidat
            const sig_kandidat = "0x1d74761b6a209a993506e8e12aa27597bc671cdc1753d4da84363f13284b76d9449b996f7d6b460d46c416c07471cf105c69ce766c738ca1a58a366305ec84811c"
            const bytes_name = "0x660661ef173d593dd34075616e42618861ee284490dc1a9466cc1a883160e3dd"
            await this.instance.KandidatRegister(
                1,
                0,
                livetime,
                bytes_name,
                sig_kandidat
            );

            // Pendaftaran Pemilih
            const sig_pemilih = "0x6abb89de11b8d3487af15efda74941359f1f80c6668a626c4d5c71b3f40f9bd31fcbf220321c68d5b427ef6b1308792daf62d43f15e188a7f7021f0a2a56495d1b"
            const pemilih_address = "0xFabf8979D3A16170ce8a13C1281268fb37e8f55b"
            this.instance.PemilihRegister(pemilih_address, 0, livetime, sig_pemilih);

            // Pemilihan
            const sign_pemilihan = "0xeb3ef6180e75d10699984aefb6331fde45fd1a8d91b290e403dc31e93ecfffb623e99923781fcf568a3812c97b775d2deabdc5b1a9217614cd481aca39c1906c1c"
            await expectRevert(
                this.instance.Voting(1, 0, livetime,sign_pemilihan),
                "Waktu pendaftaran telah ditutup"
            );
        });
        it("Melakukan Pemilihan Disaat Waktu Pemilihan Belum dimulai", async function(){
            this.instance = await vote.new("0x012F1Dfb957C87D4B940249652ddd20bC63bE83C");
            const livetime = 1627545600

            // Pengaturan waktu 
            const sig_time = "0xdea188107d0f8ec13de0bce536842af7119b0718dca0586c9894843957d04ffa5306ccc5a32cfc9eab54886406904b76a926eabdc4a5f67b872723cbc1d0adbb1c"
            await this.instance.SetupTimedata(1627538400,1627542000,1627549200,1627552800,0,sig_time);

            // Pendaftaran Kandidat
            const sig_kandidat = "0x1d74761b6a209a993506e8e12aa27597bc671cdc1753d4da84363f13284b76d9449b996f7d6b460d46c416c07471cf105c69ce766c738ca1a58a366305ec84811c"
            const bytes_name = "0x660661ef173d593dd34075616e42618861ee284490dc1a9466cc1a883160e3dd"
            await this.instance.KandidatRegister(
                1,
                0,
                1627540200,
                bytes_name,
                sig_kandidat
            );

            // Pendaftaran Pemilih
            const sig_pemilih = "0x6abb89de11b8d3487af15efda74941359f1f80c6668a626c4d5c71b3f40f9bd31fcbf220321c68d5b427ef6b1308792daf62d43f15e188a7f7021f0a2a56495d1b"
            const pemilih_address = "0xFabf8979D3A16170ce8a13C1281268fb37e8f55b"
            this.instance.PemilihRegister(pemilih_address, 0, 1627540200, sig_pemilih);

            //Pemilihan
            const sign_pemilihan = "0xeb3ef6180e75d10699984aefb6331fde45fd1a8d91b290e403dc31e93ecfffb623e99923781fcf568a3812c97b775d2deabdc5b1a9217614cd481aca39c1906c1c"
            await expectRevert(
                this.instance.Voting(1, 0, livetime,sign_pemilihan),
                "Waktu Voting belum dibuka"
            );
        });
        it("Melakukan Pemilihan Dua Kali", async function(){
            this.instance = await vote.new("0x012F1Dfb957C87D4B940249652ddd20bC63bE83C");
            const livetime = 1627545600
            // Pengaturan waktu 
            const sig_time = "0x2c69391b1fc7a97d1cc86ac268c7afecea9c138224edb9bc78b50f0a735389f47ddbbe145df0b142659529d0012fbe20eca786fc0230ab989208859156448f711b"
            await this.instance.SetupTimedata(1627534800,1627538400,1627542000,1627549200,0,sig_time);
            // Pendaftaran Kandidat
            const sig_kandidat = "0x1d74761b6a209a993506e8e12aa27597bc671cdc1753d4da84363f13284b76d9449b996f7d6b460d46c416c07471cf105c69ce766c738ca1a58a366305ec84811c"
            const bytes_name = "0x660661ef173d593dd34075616e42618861ee284490dc1a9466cc1a883160e3dd"
            await this.instance.KandidatRegister(
                1,
                0,
                1627536600,
                bytes_name,
                sig_kandidat
            );
            // Pendaftaran Pemilih
            const sig_pemilih = "0x6abb89de11b8d3487af15efda74941359f1f80c6668a626c4d5c71b3f40f9bd31fcbf220321c68d5b427ef6b1308792daf62d43f15e188a7f7021f0a2a56495d1b"
            const pemilih_address = "0xFabf8979D3A16170ce8a13C1281268fb37e8f55b"
            this.instance.PemilihRegister(pemilih_address, 0, 1627536600, sig_pemilih);
            //Pemilihan
            const sign_pemilihan = "0xeb3ef6180e75d10699984aefb6331fde45fd1a8d91b290e403dc31e93ecfffb623e99923781fcf568a3812c97b775d2deabdc5b1a9217614cd481aca39c1906c1c"
            await this.instance.Voting(1, 0, livetime,sign_pemilihan)
            await expectRevert(
                this.instance.Voting(1, 0, livetime,sign_pemilihan),
                "Pemilih sudah menggunakan hak pilih"
            )
        });
        it("Non Pemilih Melakukan Pemilihan", async function(){
            this.instance = await vote.new("0x012F1Dfb957C87D4B940249652ddd20bC63bE83C");
            const livetime = 1627545600
            // Pengaturan waktu 
            const sig_time = "0x2c69391b1fc7a97d1cc86ac268c7afecea9c138224edb9bc78b50f0a735389f47ddbbe145df0b142659529d0012fbe20eca786fc0230ab989208859156448f711b"
            await this.instance.SetupTimedata(1627534800,1627538400,1627542000,1627549200,0,sig_time);
            // Pendaftaran Kandidat
            const sig_kandidat = "0x1d74761b6a209a993506e8e12aa27597bc671cdc1753d4da84363f13284b76d9449b996f7d6b460d46c416c07471cf105c69ce766c738ca1a58a366305ec84811c"
            const bytes_name = "0x660661ef173d593dd34075616e42618861ee284490dc1a9466cc1a883160e3dd"
            await this.instance.KandidatRegister(
                1,
                0,
                1627536600,
                bytes_name,
                sig_kandidat
            );
            //Pemilihan
            const sign_pemilihan = "0x228e7dabb08c20908c9199168a4338703ca697f355961af7c88e958c12ff2d466c5c97af18d2bd0366c6581f38be22508f5d1c09db6d7c6d061c5db5c97cb30d1c"
            await expectRevert(
                this.instance.Voting(1, 0, livetime,sign_pemilihan),
                "Pemilih tidak memiliki hak pilih"
            );
        });
        it("Pemilih Melakukan Pemilihan", async function(){
            this.instance = await vote.new("0x012F1Dfb957C87D4B940249652ddd20bC63bE83C");
            const livetime = 1627545600
            // Pengaturan waktu 
            const sig_time = "0x2c69391b1fc7a97d1cc86ac268c7afecea9c138224edb9bc78b50f0a735389f47ddbbe145df0b142659529d0012fbe20eca786fc0230ab989208859156448f711b"
            await this.instance.SetupTimedata(1627534800,1627538400,1627542000,1627549200,0,sig_time);
            // Pendaftaran Kandidat
            const sig_kandidat = "0x1d74761b6a209a993506e8e12aa27597bc671cdc1753d4da84363f13284b76d9449b996f7d6b460d46c416c07471cf105c69ce766c738ca1a58a366305ec84811c"
            const bytes_name = "0x660661ef173d593dd34075616e42618861ee284490dc1a9466cc1a883160e3dd"
            await this.instance.KandidatRegister(
                1,
                0,
                1627536600,
                bytes_name,
                sig_kandidat
            );
            // Pendaftaran Pemilih
            const sig_pemilih = "0x6abb89de11b8d3487af15efda74941359f1f80c6668a626c4d5c71b3f40f9bd31fcbf220321c68d5b427ef6b1308792daf62d43f15e188a7f7021f0a2a56495d1b"
            const pemilih_address = "0xFabf8979D3A16170ce8a13C1281268fb37e8f55b"
            this.instance.PemilihRegister(pemilih_address, 0, 1627536600, sig_pemilih);
            //Pemilihan
            const sign_pemilihan = "0xeb3ef6180e75d10699984aefb6331fde45fd1a8d91b290e403dc31e93ecfffb623e99923781fcf568a3812c97b775d2deabdc5b1a9217614cd481aca39c1906c1c"
            const receipt = await this.instance.Voting(1, 0, livetime,sign_pemilihan)
            expectEvent(receipt,"Voted",{
                voterAddress:pemilih_address,
                kandidatID:new BN(1),
                statusVoting:true
            })
        });
    })
});
