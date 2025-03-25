// const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// module.exports = buildModule("MediDataStorageModule", (m) => {
// 	const mediDataStorage = m.contract("MediDataStorage");

// 	return { mediDataStorage };
// });
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MediDataModule", (m) => {
	// MediFactory 컨트랙트 배포
	const mediFactory = m.contract("MediFactory");

	// 여러 프로젝트에 대한 Medi 컨트랙트 생성
	const projectNames = ["AAAAA", "BBBBB", "CCCCC"];
	// const projectNames = ["AAAAA"];

	const mediCreations = projectNames.map((projectName) => {
		// MediFactory의 createMedi 함수 호출하여 각 프로젝트별 Medi 컨트랙트 생성
		return m.call(mediFactory, "createMedi", [projectName], { id: `createMedi_${projectName}` });
	});

	return {
		mediFactory,
		mediCreations,
	};
});
