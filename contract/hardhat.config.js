require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	defaultNetwork: "hardhat",

	networks: {
		hardhat: {},
		kairos: {
			url: process.env.KAIROS_TESTNET_URL || "",
			gasPrice: 250000000000,
			accounts: process.env.KAIROS_PRIVATE_KEY !== undefined ? [process.env.KAIROS_PRIVATE_KEY] : [],
		},
	},

	solidity: "0.8.0",
};
