import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../utils/Web3Provider";
import BCTable from "../components/BCTable";

function BCHome() {
	const { account, contract, connectWallet, disconnectWallet } = useWeb3();

	const [key, setKey] = useState([]);
	const [data, setData] = useState([]);
	const [medi, setMedi] = useState([]);
	const [search, setSearch] = useState("");
	const [searchResult, setSearchResult] = useState([]);
	function transformData(keys, values) {
		const dataMap = new Map();

		keys.forEach((key, index) => {
			const parts = key.split(":");
			// console.log("parts: ", parts);
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
		// if (account) {
		// 	const fetchData = async () => {
		// 		try {
		// 			const [keyResult, valueResult] = await contract.searchData("AAAAA");
		// 			// console.log(keyResult, valueResult);
		// const keyResultArr = Array.from(keyResult);
		// setKey(keyResultArr);
		// console.log(keyResult);
		// const valueResultArr = valueResult.map((v) => v.toString());
		// setData(valueResultArr);
		// 		} catch (error) {
		// 			console.error("검색 오류");
		// 		}
		// 	};
		// 	fetchData();
		// }
		// console.log("contract:", contract);
		// console.log("account:", account);
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
		console.log(medi);
	}, [medi]);

	const handleChange = (event) => {
		setSearch(event.target.value);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		//여기서 작성
		if (!account) {
			alert("지갑 먼저 연결해주세요!");
			return;
		}

		const fetchData = async () => {
			try {
				//모든 컨트랙트에서 일치하는 총 개수 확인
				const [totalMatches, contractsWithMatches] = await contract.getTotalMatchCount(search);
				console.log(`검색결과: ${totalMatches}개 (${contractsWithMatches}개 컨트랙트)`);

				if (Number(totalMatches) === 0) {
					setSearchResult([]);
					return;
				}

				//총 컨트랙트 수
				const totalContracts = await contract.getContractCount();

				//검색 결과를 저장할 배열
				const allKeyResults = [];
				const allValueResults = [];
				const offset = 0;
				const pageSize = 10;
				//각 컨트랙트를 순차적으로 검색
				for (let i = 0; i < totalContracts; i++) {
					try {
						const [source, keys, values, total, matchingResult] = await contract.searchAllPaged(
							search,
							i,
							offset,
							pageSize
						);

						// const results = keys.map((key, index) => ({
						// 	contractAddress: source,
						// 	contractIndex: i,
						// 	key: key,
						// 	value: values[index].toString(),
						// }));

						// allResults.push(...results);

						const keyResultArr = Array.from(keys);
						allKeyResults.push(...keyResultArr);
						// setKey(keyResultArr);
						// console.log(keyResultArr);
						const valueResultArr = values.map((v) => v.toString());
						allValueResults.push(...valueResultArr);
						// setData(valueResultArr);
					} catch (error) {
						console.error(`{i} 컨트랙트 검색 중 오류`);
						continue; //오류 발생해도 다음 컨트랙트 진행행
					}
				}
				console.log(`총 ${allKeyResults.length}개 결과 찾음: `);
				setKey(allKeyResults);
				setData(allValueResults);
			} catch (error) {
				console.error("검색 오류");
			}
		};

		fetchData();
	};
	return (
		<>
			<div className="">
				<div className="flex">
					{account ? (
						<div>
							<p>
								연결된 지갑: {account.substring(0, 8) + "..." + account.substring(account.length - 5)}
							</p>
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
					<form onSubmit={handleSubmit}>
						<div>
							<input
								placeholder="검색어"
								className=" bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg 
                   focus:ring-blue-500 focus:border-blue-500 p-2.5"
								name="search"
								value={search}
								onChange={handleChange}
							/>
							<button
								type="submit"
								className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full sm:w-auto px-10 py-2.5 text-center cursor-pointer"
							>
								검색
							</button>
						</div>
					</form>
				</div>
				<BCTable data={medi} />
			</div>
		</>
	);
}

export default BCHome;
