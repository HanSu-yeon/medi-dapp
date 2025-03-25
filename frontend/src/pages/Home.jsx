import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Web3Provider";
// import MediDataStorageArtifacts from "../../../contract/artifacts/contracts/MediData.sol/MediDataStorage.json";

/**
 * 지갑
 *
 * 1. 데이터 입력
 * 화면에서 값 입력 -> 소수를 정수로 변환 -> 블록체인에 저장
 *
 * 2. 데이터 조회
 * 지갑 주소 입력 -> 모든 데이터들 정수를 소수로 변환 -> 화면에 출력
 *
 */

const initData = {
	sbp: "", //수축기 혈압
};

function Home() {
	const { account, contract, connectWallet, disconnectWallet } = useWeb3();
	const [mediData, setMediData] = useState(initData);
	// const [contractInstance, setContractInstance] = useState(null);

	const DECIMAL = 10 ** 2;

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
		if (!contract) {
			console.error("Contract is not initialized!!");
			return;
		}

		const convertedValue = convertToInteger(mediData);

		console.log("바뀐 숫자", convertedValue);

		try {
			const tx = await contract.setPatientData("test:110:sbp", convertedValue.sbp);
			await tx.wait(); //tx블록에 포함될때까지 대기
			console.log("트랜잭션 성공:", tx);
		} catch (error) {
			console.error("트랜잭션 실패: ", error);
		}
	};

	return (
		<>
			{/*TODO 숫자만 입력 가능하게 유효성 검사*/}
			<div className="max-w-md mx-auto mt-5">
				{account ? (
					<div>
						<p>연결된 지갑: {account.substring(0, 8) + "..." + account.substring(account.length - 5)}</p>
						<button
							onClick={disconnectWallet}
							className="bg-blue-100  font-medium rounded-lg text-sm sm:w-auto px-10 py-2.5 text-center cursor-pointer"
						>
							지갑 연결 해제
						</button>
					</div>
				) : (
					<button
						onClick={connectWallet}
						className="bg-red-100 font-medium rounded-lg text-sm sm:w-auto px-10 py-2.5 text-center cursor-pointer "
					>
						지갑 연결
					</button>
				)}

				<h1 className="text-3xl font-semibold  mb-7">데이터 등록</h1>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex items-center">
						<label htmlFor="sbp" className="w-32 text-gray-500 font-medium">
							Sbp:
						</label>
						<input
							name="sbp"
							id="sbp"
							className="flex-1 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg 
                   focus:ring-blue-500 focus:border-blue-500 p-2.5"
							value={mediData.sbp}
							onChange={handleChange}
						/>
					</div>

					<div className="flex justify-center mt-5">
						<button
							type="submit"
							className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full sm:w-auto px-10 py-2.5 text-center cursor-pointer"
						>
							등록
						</button>
					</div>
				</form>
			</div>
		</>
	);
}

export default Home;
