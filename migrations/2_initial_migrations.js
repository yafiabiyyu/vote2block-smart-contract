const Vote2Block = artifacts.require("Vote2Block");

module.exports = function (deployer, networks, accounts) {
  deployer.deploy(Vote2Block,"0x43A1E7D5A9dB6AbF045F7Ff5C87A9A4b39591368");
};
