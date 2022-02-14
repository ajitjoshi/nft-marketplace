require("@nomiclabs/hardhat-waffle");
const projectId = "793b9e50583f483791a6cf49ae3c54b0";
const fs = require("fs");
const privateKey = fs.readFileSync(".secret").toString();
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks : {
    hardhat: {
      chainId: 1337
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${projectId}`,
      accounts: [privateKey]
    },
    mainnet: {
      url: `https://ropsten.infura.io/v3/${projectId}`,
      accounts: [privateKey]
    }
  },
  solidity: "0.8.4",
};

//https://mainnet.infura.io/v3/793b9e50583f483791a6cf49ae3c54b0
