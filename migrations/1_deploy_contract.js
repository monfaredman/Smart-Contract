const UserContract = artifacts.require("UserContract");

module.exports = function (deployer) {
  deployer.deploy(UserContract);
};
