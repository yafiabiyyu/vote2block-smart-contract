module.exports = async function main(callback){
  try {
    const accounts = await web3.eth.getAccounts();
    const timestamp = await Date.now();
    //console.log(timestamp);
    //console.log(accounts);

    // Setup Vote2Block smart-contract
    const Vote2Block = artifacts.require("Vote2Block");
    const vote2block = await Vote2Block.deployed();

    console.log("Contract Address : ", vote2block.address);

    //Ketua penyelenggara menambahkan admin petugas kedalam smart-contract
    adminPetugas = await vote2block.addAdminPetugas(accounts[1],{from:accounts[0]});
    //console.log(adminPetugas);
    callback(0);
  }catch (error){
    console.error(error);
    callback(1);
  }
}
