const fs = require("fs");
const path = require("path");
const { ethers, JsonRpcProvider, Contract } = require("ethers");
const csv = require("fast-csv");

// rpc url, 계정, 컨트랙트
// const KAIROS_TESTNET_URL = "https://public-en-kairos.node.kaia.io";
// const PRIVATEKEY = "0xf64fd3de3ef3ae6058adc84340ef494f16ba4e28c3d7df90a4118fbb64183803";
const PRIVATEKEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const DECIMAL = 10 ** 2;
//샘플 데이터 파일
const csvFilePath = path.join(__dirname, "/csv/sample_data_10.csv");

const PROJECT_NAME = "TEST2";
const BATCH_SIZE = 30;
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const content = fs.readFileSync(csvFilePath, "utf8");
const lines = content.trim().split("\n");
const headers = lines[0].split(",").map((h) => h.trim());
console.log(headers);

function createKey(project, userId, column) {
	return `${project}:${userId}:${column}`;
}

const mediSystemABI = [
	"function submitSyntheticData(string  _projectName,string[] _columnKeys,uint256[]  _values) public",
	"function getTotalMatchCount(string _search) public view returns(uint256)",
	"function searchPublicData(string _search, uint256 _offset, uint256 _limit) public view returns(string[] memory, uint256[] memory)",
	"function createProject(string memory _projectName) public",
];

const mediFactoryABI = ["function getAllProject() public view returns(string[] memory)"];

//메인 실행 함수
async function main() {
	// console.log("csv 배치 처리 시작");
	// console.log(프로젝트명: ${PROJECT_NAME});
	// console.log(csv 파일: ${csvFilePath});
	// console.log(MediSystem 컨트랙트 주소: ${CONTRACT_ADDRESS});

	//공급자 설정 https://docs.ethers.org/v6/api/providers/jsonrpc/#JsonRpcProvider
	const provider = new JsonRpcProvider("http://localhost:8545/");
	//지갑 설정
	const wallet = new ethers.Wallet(PRIVATEKEY, provider);
	console.log(`계정 주소: ${wallet.address}`);

	//컨트랙트 인스턴스 설정
	const mediSystem = new Contract(CONTRACT_ADDRESS, mediSystemABI, wallet);
	const mediFactory = new Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", mediFactoryABI, wallet);

	//배치 처리를 위한 배열
	let columnKeys = [];
	let columnValues = [];
	let totalProcessed = 0;
	let batchQueue = []; // 배치 작업들을 저장할 배열

	for (let i = 1; i < headers.length; i++) {
		if (headers[i].length !== 3) {
			console.error("컬럼명 에러");
			return;
		}
	}

	const createproj = await mediSystem.createProject(PROJECT_NAME);
	await createproj.wait();
	console.log("Project created successfully:", createproj.hash);
	//CSV 파일 읽기 및 처리
	return new Promise((resolve, reject) => {
		fs.createReadStream(csvFilePath)
			.pipe(csv.parse({ headers: true }))
			.on("data", (row) => {
				const userId = row.useridx;
				if (userId.length !== 7) {
					console.warn(`경고: '${userId}'는 7자가 아니다. 건너뛰겠음~!!`); //다음 행 검사
					return;
				}
				//userId를 제외한 모든 컬럼 처리
				const values = Object.entries(row)
					.filter(([key]) => key !== "useridx")
					.map(([, value]) => value);
				// console.log(values);

				for (let i = 0; i < values.length; i++) {
					if (values[i] !== "" && values[i] !== undefined) {
						const columnKey = createKey(PROJECT_NAME, userId, headers[i + 1]);
						const convertedVal = Number((values[i] * DECIMAL).toFixed(0)); //소수 -> 정수로
						// console.log(columnKey, convertedVal);

						columnKeys.push(columnKey);
						columnValues.push(convertedVal);

						if (columnKeys.length >= BATCH_SIZE) {
							// 배치 정보를 큐에 저장
							batchQueue.push({
								projectName: PROJECT_NAME,
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
			.on("end", async () => {
				//남은 데이터 처리
				if (columnKeys.length > 0) {
					batchQueue.push({
						projectName: PROJECT_NAME,
						keys: [...columnKeys],
						values: [...columnValues],
					});
				}
				console.log(`처리할 배치 수: ${batchQueue.length}`);

				let successCount = 0;
				for (let i = 0; i < batchQueue.length; i++) {
					const batch = batchQueue[i];
					try {
						console.log(`배치 ${i + 1}/${batchQueue.length} 처리 중...`);
						await processBatch(mediSystem, batch.projectName, batch.keys, batch.values);
						successCount++;
						totalProcessed += batch.keys.length;
					} catch (error) {
						console.error(`배치 ${i + 1} 처리 실패:`, error);
						// 오류 발생 시에도 계속 진행
					}
				}

				console.log(
					`csv 파일 처리 완료. 총 ${totalProcessed}개 처리 (${successCount}/${batchQueue.length} 배치 성공`
				);

				//저장된 데이터 확인
				try {
					const all = await mediFactory.getAllProject();
					console.log(all);
					const count = await mediSystem.getTotalMatchCount(PROJECT_NAME);
					console.log(`프로젝트 ${PROJECT_NAME}에 저장된 총 개수??? :${count}`);

					const [keys, vals] = await mediSystem.searchPublicData(PROJECT_NAME, 0, 5);
					console.log();
					console.log("------------------저장된 데이터 샘플------------------");
					for (let i = 0; i < keys.length; i++) {
						console.log(`${keys[i]}: ${vals[i]}`);
					}
				} catch (error) {
					console.error("데이터 조회 중 오류 발생: ", error);
				}
				resolve();
			})
			.on("error", (error) => {
				console.error(`CSV 파일 처리 오류: ${error}`);
				reject(error);
			});
	});
}

async function processBatch(contract, PROJECT_NAME, columnKeys, columnValues) {
	try {
		console.log(`배치 처리 시작: ${columnKeys.length}개 항목`);

		//첫번째와 마지막 항목 로그 출력
		console.log(`첫 번째 항목: ${columnKeys[0]} = ${columnValues[0]}`);
		console.log(`마지막 항목: ${columnKeys[columnKeys.length - 1]} = ${columnValues[columnValues.length - 1]}`);

		const tx = await contract.submitSyntheticData(
			PROJECT_NAME,
			columnKeys,
			columnValues,
			{
				gasLimit: 5000000,
			}
			// , {
			// gasLimit: 5000000, //가스 한도 설정
			// gasPrice: ethers.parseUnits("50", "gwei"),
			// }
		);

		console.log(`트랜잭션 전송됨: ${tx.hash}`);

		const receipt = await tx.wait();
		console.log(`트랜잭션 확인됨: 블록 #${receipt.blockNumber}, 가스 사용: ${receipt.gasUsed.toString()}`);
	} catch (error) {
		console.error("배치 처리 오류: ", error);
		//오류 세부 정보 출력
		if (error.reason) {
			console.error("오류 원인: ", error.reason);
		}
		if (error.code) {
			console.error("오류 코드: ", error.code);
		}
		if (error.transactionHash) {
			console.error("실패한 트랜잭션 해시: ", error.transactionHash);
		}
		throw error;
	}
}
// 스크립트 실행
if (require.main === module) {
	main()
		.then(() => process.exit(0))
		.catch((error) => {
			console.error("프로그램 실행 중 오류 발생:", error);
			process.exit(1);
		});
}
