const TaxContract = artifacts.require("TaxContract");

module.exports = function (deployer) {
  deployer.deploy(TaxContract, "Tax Contract");
};
