const Penyelenggara = artifacts.require("Penyelenggara");

module.exports = function (deployer, networks, accounts) {
  deployer.deploy(Penyelenggara,accounts[0]);
};
