const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Medi와 MediFactory 테스트", function () {
	//테스트를 위한 기본 설정을 정의하는 fixture
	async function deployMediFactoryFixture() {
		//컨트랙트 배포자와 사용자 계정을 가져옴
		const [owner, otherAccount] = await ethers.getSigners();

		//Medi 컨트랙트를 배포하기 위해 먼저 컨트랙트 팩토리를 가져옴
		const MediFactory = await ethers.getContractFactory("MediFactory");
		const Medi = await ethers.getContractFactory("Medi");

		//MediFactory 컨트랙트 배포
		const mediFactory = await MediFactory.deploy();

		return { mediFactory, Medi, owner, otherAccount };
	}

	describe("MediFactory 배포 및 기본 함수 테스트", function () {
		it("MediFactory가 정상적으로 배포되어야 함", async function () {
			const { mediFactory } = await loadFixture(deployMediFactoryFixture);
			expect(await mediFactory.getContractCount()).to.equal(0);
		});

		it("새로운 Medi 컨트랙트를 생성할 수 있어야 함", async function () {
			const { mediFactory } = await loadFixture(deployMediFactoryFixture);

			//새 Medi 컨트랙트 생성
			const projectName = "proj1";
			await expect(mediFactory.createMedi(projectName))
				.to.emit(mediFactory, "MediCreated")
				.withArgs(projectName, anyValue);

			//컨트랙트 카운트가 1이어야 함
			expect(await mediFactory.getContractCount()).to.equal(1);

			//프로젝트 이름으로 주소 조회 가능해야 함
			const mediAddress = await mediFactory.getMediAddress(projectName);
			expect(mediAddress).to.not.equal(ethers.ZeroAddress);

			// getContractAt 함수 테스트
			const contractAtIdx = await mediFactory.getContractAt(0);
			expect(contractAtIdx).to.equal(mediAddress);
		});

		it("동일한 프로젝트 이름으로 중복 생성 시 실패해야 함", async function () {
			const { mediFactory } = await loadFixture(deployMediFactoryFixture);

			const projectName = "proj1";
			await mediFactory.createMedi(projectName);

			//같은 이름으로 두 번째 생성 시도는 실패해야 함
			await expect(mediFactory.createMedi(projectName)).to.be.revertedWith("Project already exists");
		});

		it("존재하지 않는 인덱스로 getContractAt 호출 시 실패해야 함", async function () {
			const { mediFactory } = await loadFixture(deployMediFactoryFixture);
			await expect(mediFactory.getContractAt(0)).to.be.revertedWith("Index out of bounds");
		});
	});

	describe("Medi 데이터 관리 및 검색 테스트", function () {
		it("생성된 Medi 컨트랙트가 초기화 데이터를 가져야 함", async function () {
			const { mediFactory } = await loadFixture(deployMediFactoryFixture);

			const projectName = "testP";
			await mediFactory.createMedi(projectName);
			const mediAddress = await mediFactory.getMediAddress(projectName);

			//Medi 컨트랙트 인스턴스 가져오기
			const medi = await ethers.getContractAt("Medi", mediAddress);

			//초기화된 데이터 개수 확인(10명의 환자, 각 10개 컬럼 = 100개)
			expect(await medi.getKeyLength()).to.equal(100);

			//프로젝트 이름 확인
			expect(await medi.projectName()).to.equal(projectName);

			//초기 데이터 확인(ex: 첫 번 째 환자의 첫 번째 컬럼)
			const sampleKey = `${projectName}:usrid01:cls`;
			expect(await medi.patientColumnData(sampleKey)).to.equal(0);
		});

		it("새로운 환자 데이터를 추가할 수 있어야 함", async function () {
			const { mediFactory } = await loadFixture(deployMediFactoryFixture);

			const projectName = "testP";
			await mediFactory.createMedi(projectName);
			const mediAddress = await mediFactory.getMediAddress(projectName);
			const medi = await ethers.getContractAt("Medi", mediAddress);

			//새로운 데이터 추가
			const newKey = `${projectName}:usrid60:sbp`;
			const newValue = 145;

			//이벤트 확인
			await expect(medi.setPatientData(newKey, newValue))
				.to.emit(medi, "DataStored")
				.withArgs(anyValue, newKey, newValue);

			//데이터 확인
			expect(await medi.patientColumnData(newKey)).to.equal(newValue);

			//키 개수 확인(기존 100 + 새로운 1개)
			expect(await medi.getKeyLength()).to.equal(101);
		});
	});

	describe("검색 기능 테스트", function () {
		it("isMatchedData 함수가 올바르게 패턴을 확인해야 함", async function () {
			const { mediFactory } = await loadFixture(deployMediFactoryFixture);

			const projectName = "proj1";
			await mediFactory.createMedi(projectName);
			const mediAddress = await mediFactory.getMediAddress(projectName);
			const medi = await ethers.getContractAt("Medi", mediAddress);

			//프로젝트명(5글자) 검색
			expect(await medi.isMatchedData("proj1:usrid01:sbp", "proj1")).to.be.true;
			expect(await medi.isMatchedData("proj2:usrid01:sbp", "proj1")).to.be.false;

			//환자id(7글자) 검색
			expect(await medi.isMatchedData("proj1:usrid01:sbp", "usrid01")).to.be.true;
			expect(await medi.isMatchedData("proj1:usrid02:sbp", "usrid01")).to.be.false;

			//컬럼명(3글자) 검색
			expect(await medi.isMatchedData("proj1:usrid01:sbp", "sbp")).to.be.true;
			expect(await medi.isMatchedData("proj1:usrid01:sbp", "cls")).to.be.false;

			//유효하지 않은 검색어 길이
			expect(await medi.isMatchedData("proj1:usrid01:sbp", "sb")).to.be.false;
			expect(await medi.isMatchedData("proj1:usrid01:sbp", "prosdfsdfj")).to.be.false;
		});

		it("getMatchCount가 일치한 개수를 정확하게 반환해야 함", async function () {
			const { mediFactory } = await loadFixture(deployMediFactoryFixture);

			const projectName = "testP";
			await mediFactory.createMedi(projectName);
			const mediAddress = await mediFactory.getMediAddress(projectName);
			const medi = await ethers.getContractAt("Medi", mediAddress);

			//프로젝트명 검색(전체 100개 데이터 일치)
			expect(await medi.getMatchCount("testP")).to.equal(100);

			//환자 id 검색(각 환자당 10개 컬럼 = 10개 일치)
			expect(await medi.getMatchCount("usrid01")).to.equal(10);

			//일치하지 않는 검색어
			expect(await medi.getMatchCount("none")).to.equal(0);
		});

		it("searchDataPaged가 페이지네이션을 올바르게 적용해야 함", async function () {
			const { mediFactory } = await loadFixture(deployMediFactoryFixture);

			const projectName = "testP";
			await mediFactory.createMedi(projectName);
			const mediAddress = await mediFactory.getMediAddress(projectName);
			const medi = await ethers.getContractAt("Medi", mediAddress);

			//첫 페이지(offset 0, limit 10)
			const [keys1, values1] = await medi.searchDataPaged("testP", 0, 10);
			expect(keys1.length).to.equal(10);

			//두 번째 페이지(offset 10, limit 10)
			const [keys2, values2] = await medi.searchDataPaged("testP", 10, 10);
			expect(keys2.length).to.equal(10);

			//첫 페이지와 두 번째 페이지는 달라야 함
			expect(keys1[0]).to.not.equal(keys2[0]);

			//limit이 전체 결과보다 큰 경우(offset 120, limit 10);
			const [keys3, values3] = await medi.searchDataPaged("testP", 95, 10);
			expect(keys3.length).to.equal(5);

			//결과가 없는 검색어
			const [keys4, values4] = await medi.searchDataPaged("none", 0, 10);
			expect(keys4.length).to.equal(0);
		});
	});

	describe("MediFactory 검색 및 통합 기능 테스트", function () {
		it("페이지네이션이 searchAllPaged에서 올바르게 작동해야 함", async function () {
			const { mediFactory } = await loadFixture(deployMediFactoryFixture);

			await mediFactory.createMedi("testP");

			// 첫 번째 페이지(offset 0)-프로젝트명으로 검색
			const [source1, keys1, values1, totalContracts1, matchingContract1] = await mediFactory.searchAllPaged(
				"testP",
				0,
				0,
				5
			);
			expect(keys1.length).to.equal(5); //5개 결과

			//두 번째 페이지(offset 5)-프로젝트명으로 검색
			const [source2, keys2, values2, totalContracts2, matchingContract2] = await mediFactory.searchAllPaged(
				"testP",
				0,
				5,
				5
			);
			expect(keys2.length).to.equal(5); //5개 결과

			//페이지의 결과가 서로 달라야 함
			expect(keys1[0]).to.not.equal(keys2[0]);
		});
	});
});
