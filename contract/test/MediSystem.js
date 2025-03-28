const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("의료 데이터 시스템 테스트 코드", function () {
	// 기본 설정을 위한 fixture 함수
	async function deployMediFactoryFixture() {
		// 컨트랙트 배포자 및 사용자 계정
		const [deployer, dataProvider, user1, user2] = await ethers.getSigner();
		// MediFactory 컨트랙트 배포
		const MediFactoy = await ethers.getContractFactory("MediFactory");
		const mediFactory = await MediFactoy.deploy();
		await mediFactory.waitForDeployment();

		//MediSystem
		const MediSystem = await ethers.getContractFactory("MediSystem");
		const mediSystem = await MediSystem.deploy();
	}
});
