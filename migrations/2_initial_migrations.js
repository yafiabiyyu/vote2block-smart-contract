const Vote2Block = artifacts.require("Vote2Block");

module.exports = function (deployer, networks, accounts) {
  deployer.deploy(Vote2Block,"0x98F1131099518B6F2197115e7A3EF46b4DC57F9f");
};
