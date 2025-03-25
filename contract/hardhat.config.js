require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	networks: {
		hardhat: {
			// accounts: process.env.PRIVATE_KEY
			// 	? [{ privateKey: process.env.PRIVATE_KEY, balance: "1000000000000000000000" }]
			// 	: undefined,
		},
		kairos: {
			url: process.env.KAIROS_TESTNET_URL || "",
			gasPrice: 250000000000,
			accounts: process.env.KAIROS_PRIVATE_KEY !== undefined ? [process.env.KAIROS_PRIVATE_KEY] : [],
		},
	},
	solidity: {
		version: "0.8.20",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
			viaIR: true, // ✅ IR 최적화 사용
		},
	},
	gasReporter: {
		enabled: true,
		currency: "USD",
		gasPrice: 21,
		showTimeSpent: true,
	},
};
