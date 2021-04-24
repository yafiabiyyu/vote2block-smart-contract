const Vote2Block = artifacts.require("Vote2Block");

module.exports = function (deployer, networks, accounts) {
  deployer.deploy(Vote2Block,"0x0369FCBDaDB6E9AcE265a1895114e261Df41248d");
};
