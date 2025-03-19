import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Web3Provider";
import BCTable from "../components/BCTable";
import { StyledEngineProvider } from "@mui/material";

function BCHome() {
	const { account, contract, connectWallet, disconnectWallet } = useWeb3();

	const [key, setKey] = useState([]);
	const [data, setData] = useState([]);
	const [medi, setMedi] = useState([]);

	function transformData(keys, values) {
		const dataMap = new Map();

		keys.forEach((key, index) => {
			const parts = key.split(":");
			if (parts.length !== 3) return;

			const [project, id, attribute] = parts;
			const keyId = `${project}:${id}`;

			// 기존 데이터가 없으면 새 객체 생성
			if (!dataMap.has(keyId)) {
				dataMap.set(keyId, { project, id });
			}

			// 속성값 저장 (속성 이름을 동적으로 추출)
			dataMap.get(keyId)[attribute] = values[index] !== undefined ? values[index] : null;
		});

		return { data: Array.from(dataMap.values()) };
	}

	useEffect(() => {
		if (account) {
			const fetchData = async () => {
				try {
					const [keyResult, valueResult] = await contract.searchData("AAAAA");
					// console.log(keyResult, valueResult);
					const keyResultArr = Array.from(keyResult);
					setKey(keyResultArr);
					const valueResultArr = valueResult.map((v) => v.toString());
					setData(valueResultArr);
				} catch (error) {
					console.error("검색 오류");
				}
			};

			fetchData();
		}
	}, [account]);

	useEffect(() => {
		if (data.length !== 0 && key.length !== 0) {
			const transformedData = transformData(key, data);
			const getData = JSON.stringify(transformedData.data, null, 2);
			const convertJson = JSON.parse(getData);
			setMedi(convertJson);
		}
	}, [data, length]);

	useEffect(() => {
		// 🔹 변환 실행
		// console.time("TransformData");
		// const transformedData = transformData(keys, values);
		// console.timeEnd("TransformData");
		// const getData = JSON.stringify(transformedData.data, null, 2);
		// console.log(JSON.stringify(transformedData.data, null, 2));
		// const convertJson = JSON.parse(getData);
		// setMedi(convertJson);
	}, []);

	// useEffect(() => {
	// 	console.log(medi);
	// }, [medi]);

	return (
		<>
			<div className="">
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

				<BCTable data={medi} />
			</div>
		</>
	);
}

export default BCHome;
