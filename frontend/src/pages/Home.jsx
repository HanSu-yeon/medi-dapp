import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
/**
 * 지갑 주소 보여줭?
 *
 * 1. 데이터 입력
 * 화면에서 값 입력 -> 소수를 정수로 변환 -> 블록체인에 저장
 *
 * 2. 데이터 조회
 * 지갑 주소 입력 -> 모든 데이터들 정수를 소수로 변환 -> 화면에 출력
 *
 */

const LOCAL_TESTNET_URL = "http://127.0.0.1:8545";
const PRIVATEKEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const CONTRACT_ADDRESS = "";

const ABI = "";
function Home() {
	const [contractInstance, setContractInstance] = useState(null);
	const initData = {
		class: "", //심장병 유무
		sbp: "", //수축기 혈압
		tobacco: "", //흡연 여부 or 흡연량
		ldl: "", //저밀도 지단백질
		adiposity: "", //체지방률(비만도)
		famhist: "", //가족력
		typea: "", //A형 성격
		obesity: "", //비만
		alcohol: "", //알코올 섭취 여부 or 섭취량
		age: "", //연령
	};

	const [mediData, setMediData] = useState(initData);

	//삭제
	const [data, setData] = useState("");

	const DECIMAL = 10 ** 2;

	//블록체인 세팅
	useEffect(() => {
		// const setupContract = async () => {
		// 	const provider = new ethers.JsonRpcProvider(LOCAL_TESTNET_URL);
		// 	//서명자 생성
		// 	const wallet = new ethers.Wallet(PRIVATEKEY, provider);
		// 	//컨트랙트 인스턴스 생성
		// 	const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
		// 	setContractInstance(contract);
		// };
		// setupContract();
	}, []);

	const convertToInteger = (data) => {
		const result = { ...data };

		Object.keys(data).forEach((key) => {
			if (result[key] !== "") {
				result[key] = Number((result[key] * DECIMAL).toFixed(0));
			}
		});

		return result;
	};

	const handleChange = (event) => {
		//rawValue
		const { value, name } = event.target;
		console.log(value, name);
		setMediData({ ...mediData, [name]: value });
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!contractInstance) {
			console.error("Contract is not initialized!!");
			return;
		}

		// CLASS, famhist, age 제외하고 소수-> 정수로 바꾸기
		console.log(convertToInteger(mediData));

		// const convertedValue = Number((tobacco * DECIMAL).toFixed(0));
		// console.log("변경된 숫자: ", convertedValue);

		try {
			const tx = await contractInstance.storeDecimal(convertedValue);
			await tx.wait(); //tx블록에 포함될때까지 대기
			console.log("트랜잭션 성공:", tx);
		} catch (error) {
			console.error("트랜잭션 실패: ", error);
		}
	};

	const getData = async (event) => {
		console.log("클릭");
		const value = await contractInstance.getDecimal();
		const rawValue = parseFloat(value.toString()) / DECIMAL;
		setData(rawValue);
	};
	return (
		<>
			{/*TODO 숫자만 입력 가능하게 유효성 검사*/}
			<form onSubmit={handleSubmit}>
				<label htmlFor="">class: </label>
				<input name="class" value={mediData.class} onChange={handleChange} />

				<label htmlFor="">sbp: </label>
				<input name="sbp" value={mediData.sbp} onChange={handleChange} />

				<label htmlFor="">tobacco: </label>
				<input name="tobacco" value={mediData.tobacco} onChange={handleChange} />

				<label htmlFor="">ldl: </label>
				<input name="ldl" value={mediData.ldl} onChange={handleChange} />

				<label htmlFor="">adiposity: </label>
				<input name="adiposity" value={mediData.adiposity} onChange={handleChange} />

				<label htmlFor="">famhist: </label>
				<input name="famhist" value={mediData.famhist} onChange={handleChange} />

				<label htmlFor="">typea: </label>
				<input name="typea" value={mediData.typea} onChange={handleChange} />

				<label htmlFor="">obesity: </label>
				<input name="obesity" value={mediData.obesity} onChange={handleChange} />

				<label htmlFor="">alcohol: </label>
				<input name="alcohol" value={mediData.alcohol} onChange={handleChange} />

				<label htmlFor="">age: </label>
				<input name="age" value={mediData.age} onChange={handleChange} />

				<div>
					<button type="submit">등록</button>
				</div>
			</form>

			{/* <div>
				<button onClick={getData}>데이터 조회</button>
				<p>데이터: {data}</p>
			</div> */}
		</>
	);
}

export default Home;
