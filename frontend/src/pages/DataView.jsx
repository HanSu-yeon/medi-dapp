import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Web3Provider";

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

function DataView() {
	const { account, contract, connectWallet, disconnectWallet } = useWeb3();
	const [allMediData, setAllMediData] = useState([]);
	const [latestMediData, setLatestMediData] = useState(initData);

	const DECIMAL = 10 ** 2;

	const convertToRaw = (data) => {
		const result = { ...data };

		Object.keys(data).forEach((key) => {
			result[key] = Number(result[key]) / DECIMAL;
		});

		return result;
	};
	const handleUserData = async (event) => {
		event.preventDefault();

		const userData = await contract.getUserData();

		const convertedValue = userData.map((item) => convertToRaw(item));

		convertedValue.map((item) => {
			const medidata = {
				class: item[0],
				sbp: item[1],
				tobacco: item[2],
				ldl: item[3],
				adiposity: item[4],
				famhist: item[5],
				typea: item[6],
				obesity: item[7],
				alcohol: item[8],
				age: item[9],
			};

			setAllMediData([...allMediData, medidata]);
			// console.log(medidata);
		});
	};
	console.log("all:", allMediData);
	const handleLatestData = async (event) => {
		event.preventDefault();
		const latestData = await contract.getLatestData();

		const convertedValue = convertToRaw(latestData);
		console.log(convertedValue);
		setLatestMediData({
			class: convertedValue[0],
			sbp: convertedValue[1],
			tobacco: convertedValue[2],
			ldl: convertedValue[3],
			adiposity: convertedValue[4],
			famhist: convertedValue[5],
			typea: convertedValue[6],
			obesity: convertedValue[7],
			alcohol: convertedValue[8],
			age: convertedValue[9],
		});
	};

	return (
		<>
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
				<h1 className="text-3xl font-semibold  mb-7">마이 데이터 조회</h1>
				<div className="flex items-center">
					<div className="">
						<button
							className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full sm:w-auto px-10 py-2.5 text-center cursor-pointer"
							onClick={handleUserData}
						>
							데이터 조회
						</button>
						<p>데이터:</p>

						<button
							className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full sm:w-auto px-10 py-2.5 text-center cursor-pointer"
							onClick={handleLatestData}
						>
							최신 데이터 조회
						</button>
						<p> 최신 데이터:</p>

						<p> class: {latestMediData.class}</p>
						<p> sbp: {latestMediData.sbp}</p>
						<p> tobacco: {latestMediData.tobacco}</p>
						<p> ldl: {latestMediData.ldl}</p>
						<p> adiposity:{latestMediData.adiposity}</p>
						<p> famhist:{latestMediData.famhist}</p>
						<p>typea: {latestMediData.typea}</p>
						<p> obesity:{latestMediData.obesity}</p>
						<p>alcohol: {latestMediData.alcohol}</p>
						<p>age: {latestMediData.age}</p>
					</div>
				</div>
			</div>
		</>
	);
}

export default DataView;
