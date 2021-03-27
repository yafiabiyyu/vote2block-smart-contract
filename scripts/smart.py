#!/usr/bin/env python
# -*- coding: utf-8 -*-
from web3 import Web3, HTTPProvider
from eth_account.messages import encode_defunct
import json
import os
import time
from datetime import datetime
from random import randrange
from rich.console import Console

# setup account
default_address = "0x46c2BD892f795DEC05d853f68cA0cbA2004d9B59"
default_priv = "0xf1d77bd7b386bbea6d603b1890e8e504cb1cde96e2476d48a36b9ae9429b22f7"


ketua_address = "0x9726F4800F84aB93EEe637c1F8Df124f110e7edd"
ketua_priv = "0x557da60c28458ee8dae2d5b82e0312b1eac7e759ee685fca50c7b777d05b70f1"

admin_address = "0x95F8B7b29ceb61406c3E9FB527ab711573d946f2"
admin_priv = "0xd4433abd8ee7d5a7d0c74d15eef5b40dbc8de1b45fc1fcd56aa4ccfefe128d20"

petugas_address = "0xF47612b76C841Af949bC0d29787d3128C086c1eB"
petugas_priv = "0x605196b9f43a96dea2c42eddec9e4ce1bd7b84fd8b9a4b6f469332e38189c364"

pemilih_address = ["0x841520CAA2c22fd0E285f06e68F69b02F8F16ee3","0x7E4681d5097710dB4A52f08CD816312b94A217d4","0x1467973716208ae916dd0a15A7d583E44C6f966F"]
pemilih_priv = ["0x1c6a36dbe9ca4d9c56fc7cb17cd2332e3e17fb400c78dbf089a8f460bb5530ef","0x6eae3043df16fec3562bf93ed15f52c6ad69d604fce20334bf8610c7a5594225","0x68304b36a70debfac5103921c14a5aa53619e2815dc3db78d9373fa18d4a4ccd"]


class Vote2Block:
    def nodeSetup(self):
        w3 = Web3(HTTPProvider("http://127.0.0.1:8545"))
        w3.eth.defaultAccount = w3.eth.accounts[0]
        return w3

    def contractSetup(self):
        w3 = self.nodeSetup()
        json_file = open("../build/contracts/Vote2Block.json")
        data = json.load(json_file)
        abi = data["abi"]
        address = data["networks"]["5777"]["address"]
        contract = w3.eth.contract(address=address, abi=abi)
        return contract

    def addAdmin(self):
        w3 = self.nodeSetup()
        contract = self.contractSetup()
        ketua_nonce = w3.eth.getTransactionCount(
            w3.toChecksumAddress(ketua_address)
        )
        msg = w3.soliditySha3(
            ["address", "uint256"],
            [w3.toChecksumAddress(admin_address), ketua_nonce],
        )
        message = encode_defunct(primitive=msg)
        sign_message = w3.eth.account.sign_message(message, ketua_priv)

        # save to smart-contract
        nonce = w3.eth.getTransactionCount(
            w3.toChecksumAddress(default_address)
        )
        tx_hash = contract.functions.addAdminPetugas(
            w3.toChecksumAddress(admin_address),
            ketua_nonce,
            sign_message.signature,
        ).buildTransaction(
            {
                "chainId": 5777,
                "gas": 70000,
                "gasPrice": w3.toWei("1", "gwei"),
                "nonce": nonce,
            }
        )
        sign_tx = w3.eth.account.sign_transaction(tx_hash, default_priv)
        w3.eth.sendRawTransaction(sign_tx.rawTransaction)
        return w3.toHex(w3.keccak(sign_tx.rawTransaction))

    def setVotingTime(self):
        w3 = self.nodeSetup()
        contract = self.contractSetup()
        start_register = time.mktime(
            datetime.strptime(
                "26/03/2021 13:30:00", "%d/%m/%Y %H:%M:%S"
            ).timetuple()
        )
        finish_register = time.mktime(
            datetime.strptime(
                "26/03/2021 14:30:00", "%d/%m/%Y %H:%M:%S"
            ).timetuple()
        )
        start_voting = time.mktime(
            datetime.strptime(
                "26/03/2021 15:00:00", "%d/%m/%Y %H:%M:%S"
            ).timetuple()
        )
        finish_voting = time.mktime(
            datetime.strptime(
                "26/03/2021 15:59:00", "%d/%m/%Y %H:%M:%S"
            ).timetuple()
        )
        ketua_nonce = w3.eth.getTransactionCount(
            w3.toChecksumAddress(ketua_address)
        )
        msg = w3.soliditySha3(
            ["uint256", "uint256", "uint256", "uint256"],
            [
                int(start_register),
                int(finish_register),
                int(start_voting),
                int(finish_voting),
            ],
        )
        message = encode_defunct(primitive=msg)
        sign_message = w3.eth.account.sign_message(message, ketua_priv)

        # save to smart-contract
        nonce = w3.eth.getTransactionCount(
            w3.toChecksumAddress(default_address)
        )
        tx_hash = contract.functions.setVotingTimestampEvent(
            int(start_register),
            int(finish_register),
            int(start_voting),
            int(finish_voting),
            sign_message.signature,
        ).buildTransaction(
            {
                "chainId": 5777,
                "gas": 70000,
                "gasPrice": w3.toWei("1", "gwei"),
                "nonce": nonce,
            }
        )
        sign_tx = w3.eth.account.sign_transaction(tx_hash, default_priv)
        w3.eth.sendRawTransaction(sign_tx.rawTransaction)
        return w3.toHex(w3.keccak(sign_tx.rawTransaction))

    def addPetugas(self):
        w3 = self.nodeSetup()
        contract = self.contractSetup()

        admin_nonce = w3.eth.getTransactionCount(
            w3.toChecksumAddress(admin_address)
        )
        msg = w3.soliditySha3(
            ["address", "uint256"],
            [w3.toChecksumAddress(petugas_address), admin_nonce],
        )
        message = encode_defunct(primitive=msg)
        sign_message = w3.eth.account.sign_message(message, admin_priv)

        # save data to smart-contract
        nonce = w3.eth.getTransactionCount(
            w3.toChecksumAddress(default_address)
        )
        tx_hash = contract.functions.addPetugas(
            w3.toChecksumAddress(petugas_address),
            admin_nonce,
            sign_message.signature,
        ).buildTransaction(
            {
                "chainId": 5777,
                "gas": 70000,
                "gasPrice": w3.toWei("1", "gwei"),
                "nonce": nonce,
            }
        )
        sign_tx = w3.eth.account.sign_transaction(tx_hash, default_priv)
        w3.eth.sendRawTransaction(sign_tx.rawTransaction)
        return w3.toHex(w3.keccak(sign_tx.rawTransaction))

    def generateKandidatName(self):
        w3 = self.nodeSetup()
        kandidat1 = w3.soliditySha3(["string"], ["yafiabiyyu"])
        kandidat2 = w3.soliditySha3(["string"], ["abiyyuyafi"])
        return [kandidat1, kandidat2]

    def registerKandidat(self):
        w3 = self.nodeSetup()
        contract = self.contractSetup()
        kandidat_list = self.generateKandidatName()
        liveTime = time.mktime(
            datetime.strptime(
                "26/03/2021 14:00:00", "%d/%m/%Y %H:%M:%S"
            ).timetuple()
        )
        tx_list = []
        for i in range(len(kandidat_list)):
            idKandidat = i +1
            petugas_nonce = w3.eth.getTransactionCount(petugas_address)
            nonce = w3.eth.getTransactionCount(default_address)
            # create message
            msg = w3.soliditySha3(
                ['uint256','bytes32','uint256'],
                [idKandidat,kandidat_list[i],petugas_nonce]
            )
            message = encode_defunct(primitive=msg)
            sign_message = w3.eth.account.sign_message(message,petugas_priv)

            #save to smart-contract
            tx_hash = contract.functions.registerKandidat(
                idKandidat,
                petugas_nonce,
                int(liveTime),
                kandidat_list[i],
                sign_message.signature
            ).buildTransaction({
                "chainId":5777,
                "gas":700000,
                "gasPrice":w3.toWei('1','gwei'),
                "nonce":nonce
            })
            sign_tx = w3.eth.account.sign_transaction(tx_hash,default_priv)
            w3.eth.sendRawTransaction(sign_tx.rawTransaction)
            tx_list.append(w3.toHex(w3.keccak(sign_tx.rawTransaction)))
        return tx_list
    def registerPemilih(self):
        w3 = self.nodeSetup()
        contract = self.contractSetup()
        liveTime = time.mktime(
            datetime.strptime(
                "26/03/2021 14:00:00",
                "%d/%m/%Y %H:%M:%S"
            ).timetuple()
        )
        tx_list = []
        for i in range(len(pemilih_address)):
            petugas_nonce = w3.eth.getTransactionCount(
                w3.toChecksumAddress(petugas_address)
            )
            nonce = w3.eth.getTransactionCount(w3.toChecksumAddress(default_address))
            msg = w3.soliditySha3(
                ['address','uint256'],
                [w3.toChecksumAddress(pemilih_address[i]),petugas_nonce]
            )
            message = encode_defunct(primitive=msg)
            sign_message = w3.eth.account.sign_message(message,petugas_priv)
            
            #save to smart-contract
            tx_hash = contract.functions.registerPemilih(
                w3.toChecksumAddress(pemilih_address[i]),
                petugas_nonce,
                int(liveTime),
                sign_message.signature
            ).buildTransaction({
                "chainId":5777,
                "gas":700000,
                "gasPrice":w3.toWei('1','gwei'),
                "nonce":nonce
            })
            sign_tx = w3.eth.account.sign_transaction(tx_hash,default_priv)
            w3.eth.sendRawTransaction(sign_tx.rawTransaction)
            tx_list.append(
                w3.toHex(w3.keccak(sign_tx.rawTransaction))
            )
        return tx_list

    def VotingProcess(self):
        w3 = self.nodeSetup()
        contract = self.contractSetup()
        liveTime = time.mktime(
            datetime.strptime(
                "26/03/2021 15:30:00",
                "%d/%m/%Y %H:%M:%S"
            ).timetuple()
        )
        tx_list = []
        for i in range(len(pemilih_address)):
            pemilih_nonce = w3.eth.getTransactionCount(
                w3.toChecksumAddress(pemilih_address[i])
            )
            nonce = w3.eth.getTransactionCount(
                w3.toChecksumAddress(default_address)
            )
            kandidatID = randrange(1,3)
            msg = w3.soliditySha3(
                ['uint256','uint256'],
                [kandidatID, pemilih_nonce]
            )
            message = encode_defunct(primitive=msg)
            sign_message = w3.eth.account.sign_message(
                message,
                pemilih_priv[i] 
            )

            #save to smart-contract
            tx_hash = contract.functions.Voting(
                int(kandidatID),
                pemilih_nonce,
                int(liveTime),
                sign_message.signature
            ).buildTransaction({
                "chainId":5777,
                "gas":800000,
                "gasPrice":w3.toWei('1','gwei'),
                "nonce":nonce
            })
            sign_tx = w3.eth.account.sign_transaction(tx_hash,default_priv)
            w3.eth.sendRawTransaction(sign_tx.rawTransaction)
            tx_list.append(
                w3.toHex(
                    w3.keccak(sign_tx.rawTransaction)
                )
            )
        return tx_list

    def Pemilih(self):
        tx_pemilih = self.VotingProcess()
        return tx_pemilih
    def Petugas(self):
        kandidat_tx = self.registerKandidat()
        pemilih_tx = self.registerPemilih()
        return kandidat_tx, pemilih_tx

    def AdminPetugas(self):
        petugas_tx = self.addPetugas()
        return petugas_tx

    def KetuPenyelenggara(self):
        addAdmin_tx = self.addAdmin()
        setTime_tx = self.setVotingTime()
        return addAdmin_tx, setTime_tx

    def hasilVoting(self):
        w3 = self.nodeSetup()
        contract = self.contractSetup()
        list_kandidat = self.generateKandidatName()
        bytes32_data = contract.functions.kandidatTerpilih().call()
        if list_kandidat[0] == bytes32_data.hex():
            return "yafiabiyyu"
        else:
            return "abiyyuyafi"

    def main(self):
        admin_tx, setTime_tx = self.KetuPenyelenggara()
        petugas_tx = self.AdminPetugas()
        kandidat,pemilih = self.Petugas()
        pemilh_tx = self.Pemilih()
        pemenang = self.hasilVoting()
        console = Console()
        console.print("Pemenang pemilu : ",pemenang)



if __name__ == "__main__":
    vb = Vote2Block()
    vb.main()
