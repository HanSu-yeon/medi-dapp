// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;


contract User {
    //연결된 프로젝트 (컨트랙트 주소)
    mapping(address => address[]) userProjects;

    //진료 기록 + timestamp 들어가야함
    mapping(string => uint256) public patientColumnData;

    
    
}