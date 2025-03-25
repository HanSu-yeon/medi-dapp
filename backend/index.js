const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const { ethers } = require("ethers");

console.log(ethers);

// rpc url, 계정, 컨트랙트
const KAIROS_TESTNET_URL = "https://public-en-kairos.node.kaia.io";
const PRIVATEKEY = "0xf64fd3de3ef3ae6058adc84340ef494f16ba4e28c3d7df90a4118fbb64183803";
const CONTRACT_ADDRESS = "";
const ABI = "";

//샘플 데이터 파일
const csvFilePath = path.join(__dirname, "/csv/sample_data_50.csv");

const results = [];
fs.createReadStream(csvFilePath)
	.pipe(csv())
	.on("data", (data) => results.push(data))
	.on("end", () => {
		console.log(results);
	});
