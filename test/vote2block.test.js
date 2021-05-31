const { web3, accounts } = require('@openzeppelin/test-environment');
const { expectEvent, expectRevert, BN } = require('@openzeppelin/test-helpers');
const { expect, assert } = require('chai');
// const { before, beforeEach } = require('mocha');
const vote = artifacts.require('Vote2Block');
require('dotenv').config();

contract("Vote2Block", accounts => {
    const ketua = process.env.ketua;
    const petugas = process.env.petugas;
    const petugas2 = process.env.petugas2;
    const pemilih1 = process.env.pemilih1;
    const pemilih2 = process.env.pemilih2;
    const pemilih3 = process.env.pemilih3;
    const pemilih4 = process.env.pemilih4;
    const nonuser = process.env.nonuser;

    const startRegister = new Date(
        Date.UTC('2021','02','27','10','00','00')
    );
    const finisRegister = new Date(
        Date.UTC('2021','02','27','10','30','00')
    );
    const startVoting = new Date(
        Date.UTC('2021','02','27','11','00','00')
    );
    const finisVoting = new Date(
        Date.UTC('2021','02','27','11','30','00')
    );
    const liveTimeRegister = new Date(
        Date.UTC('2021','02','27','10','20','00')
    )
    const liveTimeVoting = new Date(
        Date.UTC('2021','02','27','11','20','00')
    )
    
    //Convert to unix timestamp
    const startregister = startRegister.getTime()/1000;
    const finisregister = finisRegister.getTime()/1000;
    const startvoting = startVoting.getTime()/1000;
    const finisvoting = finisVoting.getTime()/1000;
    const livetimeregister = liveTimeRegister.getTime()/1000;
    const livetimevoting = liveTimeVoting.getTime()/1000;

    describe("Contract Deployment", function(){
        beforeEach(async function(){
            instance = await vote.deployed();
        });
        it("Contract Address", async () => {
            assert(instance.address !== '');
        })
    });
    describe("Ketua Pelaksana", function(){
        beforeEach(async function(){
            instance = await vote.deployed();
            ketua_address = web3.eth.accounts.privateKeyToAccount(ketua).address
            ketua_nonce = await web3.eth.getTransactionCount(ketua_address);
            petugas_address = web3.eth.accounts.privateKeyToAccount(petugas).address
        });
        it("Register Petugas Baru", async () => {
            let message = web3.utils.soliditySha3(
                {
                    t:'address',
                    v:petugas_address
                },
                {
                    t:'uint256',
                    v:ketua_nonce
                }
            );
            sign_message = await web3.eth.accounts.sign(message,ketua);
            receipt = await instance.addPetugas(petugas_address,ketua_nonce, sign_message.signature);
            expectEvent(receipt,'RegisterPetugas',{
                _petugasAddress:petugas_address,
                sender:ketua_address
            });
            assert(await instance.Petugas(petugas_address) === true);
        });
        it("Remove Petugas", async () => {
            let message = web3.utils.soliditySha3(
                {
                    t:'address',
                    v:petugas_address
                },
                {
                    t:'uint256',
                    v:ketua_nonce
                }
            );
            sign_message = await web3.eth.accounts.sign(message,ketua);
            receipt = await instance.removePetugas(petugas_address, ketua_nonce, sign_message.signature);
            expectEvent(receipt,"RemovePetugas",{
                _petugasAddress:petugas_address,
                sender:ketua_address
            });
            assert(await instance.Petugas(petugas_address) === false);
        });
        it("Setup Voting & Register Timestamp", async () => {
            let message = web3.utils.soliditySha3(
                {
                    t:'uint256',
                    v:startregister
                },
                {
                    t:'uint256',
                    v:finisregister
                },
                {
                    t:'uint256',
                    v:startvoting
                },
                {
                    t:'uint256',
                    v:finisvoting
                }
            );
            sign_message = await web3.eth.accounts.sign(message,ketua);
            receipt = await instance.setVotingTimestampEvent(
                startregister,
                finisregister,
                startvoting,
                finisvoting,
                sign_message.signature
            );
            expectEvent(receipt,'VotingTimeSet',{
                startRegister:new BN(startregister),
                finisRegister:new BN(finisregister),
                startVoting:new BN(startvoting),
                finisVoting:new BN(finisvoting)
            });
        });
    });
    describe("Petugas", function(){
        let add_petugas_signature = process.env.register_petugas_signature;
        let set_timestamp_signature = process.env.voting_time_signature;

        let ketua_address = web3.eth.accounts.privateKeyToAccount(ketua).address;
        let petugas_address = web3.eth.accounts.privateKeyToAccount(petugas).address;
        let pemilih = web3.eth.accounts.privateKeyToAccount(pemilih4).address;
        before(async function(){
            let ketua_nonce = await web3.eth.getTransactionCount(ketua_address);
            petugas_nonce = await web3.eth.getTransactionCount(petugas_address);
            let instance = await vote.deployed();
            await instance.addPetugas(petugas_address,ketua_nonce,add_petugas_signature);
            await instance.setVotingTimestampEvent(startregister,finisregister,startvoting,finisvoting,set_timestamp_signature);
        });
        it("Register Kandidat", async () => {
            let kandidat_bytes_name = web3.utils.soliditySha3({t:'string',v:'Abiyyu Yafi'});
            let message = web3.utils.soliditySha3(
                {
                    t:'uint256',
                    v:new BN(1)
                },
                {
                    t:'bytes32',
                    v:kandidat_bytes_name
                },
                {
                    t:'uint256',
                    v:petugas_nonce
                }
            );
            let sign_message = await web3.eth.accounts.sign(message,petugas);
            let receipt = await instance.registerKandidat(
                1,
                petugas_nonce,
                livetimeregister,
                kandidat_bytes_name,
                sign_message.signature
            );
            expectEvent(receipt,'RegisterKandidat',{
                _kandidatID:new BN(1),
                _totalVote:new BN(0),
                _kandidatName:kandidat_bytes_name,
                sender:petugas_address
            });
            let result = await instance.getKandidatData(0);
            assert(result[0].toString() === '1');
            assert(result[1].toString() === '0');
            assert(result[2] === kandidat_bytes_name);
        });
        it("Register Pemilih", async () => {
            let message = web3.utils.soliditySha3(
                {
                    t:'address',
                    v:pemilih
                },
                {
                    t:'uint256',
                    v:petugas_nonce
                }
            );
            let sign_message = await web3.eth.accounts.sign(message,petugas);
            let receipt = await instance.registerPemilih(
                pemilih,
                petugas_nonce,
                livetimeregister,
                sign_message.signature
            );
            expectEvent(
                receipt,'RegisterPemilih',
                {
                    _pemilihAddress:pemilih,
                    _statusHakpilih:new BN(1),
                    statusVoting:false
                }
            );
            let result = await instance.pemilih(pemilih);
            assert(result[0].toString() === '1');
            assert(result[1].toString() === '0');
            assert(result[2] === false)
        });
    })
    describe("Pemilihan", function(){
        let instance;
        let ketua_nonce;
        let petugas_address
        let pemilih1_address;
        let pemilih2_address;
        let pemilih3_address;
        let add_petugas_signature;
        let set_timestamp_signature;
        before(async function(){
            instance = await vote.deployed();
            ketua_nonce = await web3.eth.getTransactionCount(web3.eth.accounts.privateKeyToAccount(ketua).address);
            petugas_address = web3.eth.accounts.privateKeyToAccount(petugas).address;
            pemilih1_address = web3.eth.accounts.privateKeyToAccount(pemilih1).address;
            pemilih2_address = web3.eth.accounts.privateKeyToAccount(pemilih2).address;
            pemilih3_address = web3.eth.accounts.privateKeyToAccount(pemilih3).address;
            // register petugas & seting voting and register time
            add_petugas_signature = process.env.register_petugas_signature;
            set_timestamp_signature = process.env.voting_time_signature;
            await instance.addPetugas(petugas_address,ketua_nonce,add_petugas_signature);
            await instance.setVotingTimestampEvent(startregister,finisregister,startvoting,finisvoting,set_timestamp_signature);
        });
        it("Pemilihan", async () => {
            // Register Kandidat 1
            let petugas1_nonce = await web3.eth.getTransactionCount(petugas_address);
            let kandidat1_bytes_name = web3.utils.soliditySha3({t:'string',v:"Abiyyu Yafi"});
            let kandidat1_message = web3.utils.soliditySha3(
                {
                    t:'uint256',
                    v:new BN(1)
                },
                {
                    t:'bytes32',
                    v:kandidat1_bytes_name
                },
                {
                    t:'uint256',
                    v:petugas1_nonce
                }
            );
            let kandidat1_sign_message = await web3.eth.accounts.sign(kandidat1_message, petugas);
            await instance.registerKandidat(
                1,
                petugas1_nonce,
                livetimeregister,
                kandidat1_bytes_name,
                kandidat1_sign_message.signature
            );

            // Register Kandidat 2
            let petugas2_nonce = await web3.eth.getTransactionCount(petugas_address);
            let kandidat2_bytes_name = web3.utils.soliditySha3({t:'string',v:"Abiyyu Yafi"});
            let kandidat2_message = web3.utils.soliditySha3(
                {
                    t:'uint256',
                    v:new BN(2)
                },
                {
                    t:'bytes32',
                    v:kandidat2_bytes_name
                },
                {
                    t:'uint256',
                    v:petugas2_nonce
                }
            );
            let kandidat2_sign_message = await web3.eth.accounts.sign(kandidat2_message, petugas);
            await instance.registerKandidat(
                2,
                petugas2_nonce,
                livetimeregister,
                kandidat2_bytes_name,
                kandidat2_sign_message.signature
            );

            // regiser Pemilih 1
            let petugas3_nonce = await web3.eth.getTransactionCount(petugas_address);
            let pemilih1_message = web3.utils.soliditySha3(
                {
                    t:'address',
                    v:pemilih1_address
                },
                {
                    t:'uint256',
                    v:petugas3_nonce
                }
            );
            let pemilih1_sign_message = await web3.eth.accounts.sign(pemilih1_message,petugas);
            await instance.registerPemilih(pemilih1_address,petugas3_nonce,livetimeregister,pemilih1_sign_message.signature);
            
            // voting
            let pemilih_nonce = await web3.eth.getTransactionCount(pemilih1_address);
            let voting_message = web3.utils.soliditySha3(
                {
                    t:'uint256',
                    v:new BN(1)
                },
                {
                    t:'uint256',
                    v:pemilih_nonce
                }
            );
            let pemilih_sign_message = await web3.eth.accounts.sign(voting_message,pemilih1);
            let voting_receipt = await instance.Voting(
                1,
                pemilih_nonce,
                livetimevoting,
                pemilih_sign_message.signature
            );
            expectEvent(voting_receipt,'Voted',{
                voter:pemilih1_address,
                kandidatID:new BN(1),
                statusVoting:true
            });
            let result = await instance.pemilih(pemilih1_address);
            assert(result[0].toString() === '1');
            assert(result[1].toString() === '1');
            assert(result[2] === true)
        });
    });
});