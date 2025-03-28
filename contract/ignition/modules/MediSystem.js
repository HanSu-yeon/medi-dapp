const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MediSystem", (m) => {
	const factory = m.contract("MediFactory");
	const system = m.contract("MediSystem", [factory]);

	return { factory, system };
});
