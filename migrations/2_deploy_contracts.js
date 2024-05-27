// eslint-disable-next-line
const Register = artifacts.require("Register");

module.exports = function (deployer) {
  deployer.deploy(Register, "Hello, World!");
};
