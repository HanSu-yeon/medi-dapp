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
const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

const ABI = [
	{
		inputs: [],
		name: "getDecimal",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getRawValue",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_val",
				type: "uint256",
			},
		],
		name: "storeDecimal",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "storedValue",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
];

function Home() {
	const [tobacco, setTobacco] = useState("");
	const [contractInstance, setContractInstance] = useState(null);

	const [data, setData] = useState("");

	const DECIMAL = 10 ** 2;

	useEffect(() => {
		const setupContract = async () => {
			const provider = new ethers.JsonRpcProvider(LOCAL_TESTNET_URL);
			//서명자 생성
			const wallet = new ethers.Wallet(PRIVATEKEY, provider);
			//컨트랙트 인스턴스 생성
			const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

			setContractInstance(contract);
		};
		setupContract();
	}, []);

	const handleChange = (event) => {
		//rawValue
		setTobacco(event.target.value);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!contractInstance) {
			console.error("Contract is not initialized!!");
			return;
		}
		const convertedValue = Number((tobacco * DECIMAL).toFixed(0));
		console.log("변경된 숫자: ", convertedValue);

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
			<form onSubmit={handleSubmit}>
				<label htmlFor="">소수 데이터</label>
				<input value={tobacco} onChange={handleChange} />
				<button type="submit">제출</button>
			</form>

			<div>
				<button onClick={getData}>데이터 조회(소수로 나와야함)</button>
				<p>데이터: {data}</p>
			</div>
		</>
	);
}

export default Home;
