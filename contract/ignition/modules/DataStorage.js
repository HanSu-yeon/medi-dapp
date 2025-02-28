const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DataStorageModule", (m) => {
	const dataStorage = m.contract("DataStorage");

	return { dataStorage };
});
