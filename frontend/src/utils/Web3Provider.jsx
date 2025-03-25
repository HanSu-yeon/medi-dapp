import React, { createContext, useReducer, useEffect } from "react";
import { ethers } from "ethers";
import MediFactoryArtifacts from "../../../contract/artifacts/contracts/MediFactory.sol/MediFactory.json";

const Web3Context = createContext();

const MediFactoryABI = MediFactoryArtifacts.abi;

const initState = {
	provider: null,
	signer: null,
	contract: null,
	account: null,
};

const web3Reducer = (state, action) => {
	switch (action.type) {
		case "SET_PROVIDER":
			return { ...state, provider: action.payload };
		case "SET_SIGNER":
			return { ...state, signer: action.payload };
		case "SET_CONTRACT":
			return { ...state, contract: action.payload };
		case "SET_ACCOUNT":
			return { ...state, account: action.payload };
		case "RESET":
			return initState;
		default:
			return state;
	}
};

export const Web3Provider = ({ children }) => {
	const [state, dispatch] = useReducer(web3Reducer, initState);

	const connectWallet = async () => {
		try {
			if (!window.ethereum) throw new Error("메타마스크 또는 카이아 지갑이 필요합니다.");

			const provider = new ethers.BrowserProvider(window.ethereum);
			await provider.send("eth_requestAccounts", []); //지갑 연결 요청

			const signer = await provider.getSigner();
			const contract = new ethers.Contract(import.meta.env.VITE_APP_CONTRACT_ADDRESS, MediFactoryABI, signer);
			const account = await signer.getAddress();

			dispatch({ type: "SET_PROVIDER", payload: provider });
			dispatch({ type: "SET_SIGNER", payload: signer });
			dispatch({ type: "SET_CONTRACT", payload: contract });
			dispatch({ type: "SET_ACCOUNT", payload: account });

			console.log("지갑 연결 성공: ", account);
		} catch (error) {
			console.error("지갑 연결 실패: ", error);
		}
	};

	const disconnectWallet = () => {
		dispatch({ type: "RESET" });
		console.log("지갑 연결 해제");
	};

	useEffect(() => {
		if (window.ethereum) {
			window.ethereum.on("accountsChanged", (accounts) => {
				if (accounts.length === 0) {
					disconnectWallet();
				} else {
					dispatch({ type: "SET_ACCOUNT", payload: accounts[0] });
				}
			});

			window.ethereum.on("chainChanged", () => {
				window.location.reload(); //체인 변경 시 새로고침
			});
		}
	}, []);

	return (
		<Web3Context.Provider value={{ ...state, connectWallet, disconnectWallet }}>{children}</Web3Context.Provider>
	);
};

export const useWeb3 = () => React.useContext(Web3Context);
