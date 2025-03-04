const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MediDataStorageModule", (m) => {
	const mediDataStorage = m.contract("MediDataStorage");

	return { mediDataStorage };
});
