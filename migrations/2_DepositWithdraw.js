const DepositWithdraw = artifacts.require("DepositWithdraw");

module.exports = function (deployer) {
  deployer.deploy(DepositWithdraw, "Example Name");
};
