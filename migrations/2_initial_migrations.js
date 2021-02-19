const Vote2Block = artifacts.require("Vote2Block");

module.exports = function (deployer, networks, accounts) {
  deployer.deploy(Vote2Block,accounts[0]);
};
