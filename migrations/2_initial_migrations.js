const Vote2Block = artifacts.require("Vote2Block");

module.exports = function (deployer, networks, accounts) {
  deployer.deploy(Vote2Block,"0x012F1Dfb957C87D4B940249652ddd20bC63bE83C");
};
