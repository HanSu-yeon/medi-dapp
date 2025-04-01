const fs = require("fs");
const path = require("path");
const { ethers, JsonRpcProvider, Contract } = require("ethers");
const csv = require("fast-csv");

/**환경 설정 */
const CONFIG = {
	//블록체인 연결 정보
	// rpc url, 계정, 컨트랙트
	// const KAIROS_TESTNET_URL = "https://public-en-kairos.node.kaia.io";
	// const PRIVATEKEY = "0xf64fd3de3ef3ae6058adc84340ef494f16ba4e28c3d7df90a4118fbb64183803";
	PROVIDER_URL: "http://localhost:8545/",
	PRIVATE_KEY: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",

	// 컨트랙트 주소
	MEDISYSTEM_ADDRESS: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
	FACTORY_ADDRESS: "0x5FbDB2315678afecb367f032d93F642f64180aa3",

	//데이터 처리 설정정
	PROJECT_NAME: "TEST9",
	BATCH_SIZE: 50, //배치 크기
	DECIMAL: 10 ** 2, //소수점 변환

	//CSV 파일 경로
	CSV_PATH: path.join(__dirname, "/csv/sample_data_50.csv"),
};

// 컨트랙트 ABI
const CONTRACTS = {
	mediSystemABI: [
		"function submitSyntheticData(string  _projectName,string[] _columnKeys,uint256[]  _values) public",
		"function getTotalMatchCount(string _search) public view returns(uint256)",
		"function searchPublicData(string _search, uint256 _offset, uint256 _limit) public view returns(string[] memory, uint256[] memory)",
		"function createProject(string memory _projectName) public",
	],
	mediFactoryABI: ["function getAllProject() public view returns(string[] memory)"],
};

// 컬럼 키 생성 함수: 프로젝트, 사용자ID, 컬럼명 조합하여 고유 키
function createKey(project, userId, column) {
	return `${project}:${userId}:${column}`;
}
/**
 * 배치 데이터 처리: 블록체인에 데이터 제출
 * @param contract 컨트랙트 인스턴스
 * @param PROJECT_NAME 프로젝트명
 * @param columnKeys 저장하려는 키 배열
 * @param columnValues 저장하려는 값 배열
 */
async function processBatch(contract, PROJECT_NAME, columnKeys, columnValues) {
	try {
		console.log(`========배치 처리 시작: ${columnKeys.length}개 항목========`);

		//첫번째와 마지막 항목 로그 출력
		console.log(`• 첫 번째 항목: ${columnKeys[0]} = ${columnValues[0]}`);
		console.log(`• 마지막 항목: ${columnKeys[columnKeys.length - 1]} = ${columnValues[columnValues.length - 1]}`);

		//트랜잭션 전송
		const tx = await contract.submitSyntheticData(PROJECT_NAME, columnKeys, columnValues, {
			gasLimit: 5000000,
			// gasPrice: ethers.parseUnits("50", "gwei"),
		});

		console.log(`• 트랜잭션 전송됨: ${tx.hash}`);

		const receipt = await tx.wait();
		console.log(`• 트랜잭션 확인됨: 블록 #${receipt.blockNumber}, 가스 사용: ${receipt.gasUsed.toString()}`);

		return true;
	} catch (error) {
		console.error(`❌배치 처리 오류: `);
		console.error(`• 메시지: ${error.message}`);

		//추가 오류 정보 출력력
		if (error.reason) console.error("• 오류 원인: ", error.reason);
		if (error.code) console.error("• 오류 코드: ", error.code);
		if (error.transactionHash) console.error("• 실패한 트랜잭션 해시: ", error.transactionHash);

		throw error;
	}
}
/**
 * CSV 데이터 읽기 및 배치 큐 생성 함수
 * @param csvPath
 * @param projectName
 * @param batchSize
 * @param headers
 * @returns
 */
async function readCsvAndCreateBatches(csvPath, projectName, batchSize, headers) {
	const batchQueue = []; // 배치 작업들을 저장할 배열
	let columnKeys = [];
	let columnValues = [];

	return new Promise((resolve, reject) => {
		fs.createReadStream(csvPath)
			.pipe(csv.parse({ headers: true }))
			.on("data", (row) => {
				const userId = row.useridx;

				//사용자 id 검증
				if (userId.length !== 7) {
					console.warn(`경고: '${userId}'는 7자가 아니다. 건너뛰겠음~!!`);
					return;
				}

				//userId를 제외한 모든 컬럼 처리
				const values = Object.entries(row)
					.filter(([key]) => key !== "useridx")
					.map(([, value]) => value);

				for (let i = 0; i < values.length; i++) {
					if (values[i] !== "" && values[i] !== undefined) {
						const columnKey = createKey(CONFIG.PROJECT_NAME, userId, headers[i + 1]);
						const convertedVal = Number((values[i] * CONFIG.DECIMAL).toFixed(0)); //소수 -> 정수로

						columnKeys.push(columnKey);
						columnValues.push(convertedVal);

						if (columnKeys.length >= CONFIG.BATCH_SIZE) {
							// 배치 정보를 큐에 저장
							batchQueue.push({
								projectName: CONFIG.PROJECT_NAME,
								keys: [...columnKeys],
								values: [...columnValues],
							});

							//배열 초기화
							columnKeys = [];
							columnValues = [];
						}
					}
				}
			})
			.on("end", (rowCount) => {
				// 남은 데이터 처리
				if (columnKeys.length > 0) {
					batchQueue.push({
						keys: [...columnKeys],
						values: [...columnValues],
					});
				}

				resolve({ batchQueue, rowCount });
			})
			.on("error", (error) => {
				console.error(`CSV 파일 처리 오류: ${error}`);
				reject(error);
			});
	});
}

// 배치 큐 순차 처리 함수
async function processBatchQueue(contract, projectName, batchQueue) {
	let successCount = 0;
	let totalProcessed = 0;

	console.log(`\n 총 처리할 배치 수: ${batchQueue.length}`);
	for (let i = 0; i < batchQueue.length; i++) {
		const batch = batchQueue[i];
		try {
			console.log(`\n 배치 ${i + 1}/${batchQueue.length} 처리 중...`);
			await processBatch(contract, projectName, batch.keys, batch.values);
		} catch (error) {
			console.error(`배치 ${i + 1}/${batchQueue.length} 처리 실패: ${error.message}`);
			//오류가 발생해도 다으 배치 처리 계속 진행
		}
	}

	return { successCount, totalProcessed };
}

async function verifyProjectData(mediSystem, mediFactory, projectName) {
	try {
		console.log("\n=====프로젝트 데이터 확인=====");

		//모든 프로젝트 조회
		const allProjects = await mediFactory.getAllProject();
		console.log(`• 등록된 프로젝트 목록: ${allProjects.join(", ")}`);

		//현재 프로젝트의 데이터 개수 조회
		const count = await mediSystem.getTotalMatchCount(projectName);
		console.log(`• 프로젝트 ${projectName}에 저장된 총 개수: ${count}`);

		// 샘플 데이터 조회
		const [keys, vals] = await mediSystem.searchPublicData(projectName, 0, 5);
		console.log("\n------------------저장된 데이터 샘플------------------");
		for (let i = 0; i < keys.length; i++) {
			console.log(`${keys[i]}: ${vals[i]}`);
		}
		console.log("------------------------------------------------------");
	} catch (error) {
		console.error("데이터 조회 중 오류 발생: ", error.message);
	}
}

//메인 실행 함수
async function main() {
	console.log("csv 배치 처리 시작");
	console.log(`• 프로젝트명: ${CONFIG.PROJECT_NAME}`);
	console.log(`• CSV 파일: ${CONFIG.CSV_PATH}`);
	console.log(`• 배치 크기: ${CONFIG.BATCH_SIZE}`);

	try {
		//공급자 설정 https://docs.ethers.org/v6/api/providers/jsonrpc/#JsonRpcProvider
		// 블록체인 공급자 및 지갑 설정
		const provider = new JsonRpcProvider(CONFIG.PROVIDER_URL);
		const wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);
		console.log(`• 계정 주소: ${wallet.address}`);

		// 컨트랙트 인스턴스 생성
		const mediSystem = new Contract(CONFIG.MEDISYSTEM_ADDRESS, CONTRACTS.mediSystemABI, wallet);
		const mediFactory = new Contract(CONFIG.FACTORY_ADDRESS, CONTRACTS.mediFactoryABI, wallet);

		//CSV 헤더 읽기
		const content = fs.readFileSync(CONFIG.CSV_PATH, "utf8");
		const lines = content.trim().split("\n");
		const headers = lines[0].split(",").map((h) => h.trim());

		//배치 처리를 위한 배열

		// USERIDX 제외한 헤더 유효성 검사 (컬럼명 길이 검증)
		for (let i = 1; i < headers.length; i++) {
			if (headers[i].length !== 3) {
				throw new Error(`컬럼명 에러: ${headers[i]}의 길이가 3이 아닙니다.`);
			}
		}
		//프로젝트 생성
		console.log(`프로젝트 '${CONFIG.PROJECT_NAME}' 생성 중...`);
		const createProj = await mediSystem.createProject(CONFIG.PROJECT_NAME);
		await createProj.wait();
		console.log(`• 프로젝트 생성 성공: ${createProj.hash}`);

		//CSV 파일 읽기 및 배치 큐 생성
		console.log("\n CSV 파일 분석 중...");
		const { batchQueue, rowCount } = await readCsvAndCreateBatches(
			CONFIG.CSV_PATH,
			CONFIG.PROJECT_NAME,
			CONFIG.BATCH_SIZE,
			headers
		);

		//배치 큐 처리
		const { successCount, totalProcessed } = await processBatchQueue(mediSystem, CONFIG.PROJECT_NAME, batchQueue);
		//처리 결과 요약
		console.log("\n CSV 파일 처리 완료");
		console.log(`총 ${rowCount}명의 데이터 중 ${totalProcessed}개 항목 처리됨`);
		console.log(
			`${batchQueue.length}개 배치 중 ${successCount}개 성공, ${batchQueue.length - successCount}개 실패`
		);

		//프로젝트 데이터 검증
		await verifyProjectData(mediSystem, mediFactory, CONFIG.PROJECT_NAME);
	} catch (error) {
		console.error("\n 프로그램 실행 중 오류 발생: ");
		console.error(`${error.message}`);
		process.exit(1);
	}
}

// 스크립트 실행
if (require.main === module) {
	main()
		.then(() => {
			console.log("프로그램 정상 종료");
			process.exit(0);
		})
		.catch((error) => {
			console.error("예기치 않은 오류 발생:", error);
			process.exit(1);
		});
}
