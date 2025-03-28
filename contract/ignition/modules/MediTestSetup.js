const MediCore = require("./MediSystem");

module.exports = buildModule("MediTestSetup", (m) => {
	const { system } = m.useModule(MediCore);
	const registerUserTx = m.call(system, "registerUser", ["usrid01"]);
	const createProjectTx = m.call(system, "createProject", ["AAAAA"]);

	return { registerUserTx, createProjectTx };
});
