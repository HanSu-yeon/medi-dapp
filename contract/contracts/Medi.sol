// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract Medi{
    //프로젝트명 저장
    string public projectName;

    //환자별 의료 데이터를 저장하는 매핑
    mapping(string => uint256) public patientColumnData;

    //저장된 키 리스트(검색 및 조회용)
    string[] public keys;

    //이벤트 정의
    event DataStored(bytes32 indexed columnKeyHash, string columnKey, uint256 value);

    constructor(string memory _projectName) {
        projectName = _projectName;
    }
   

    function _initialize(string memory _columnKey, uint256 _value) internal {
        if (patientColumnData[_columnKey] == 0 && bytes(_columnKey).length > 0) {
            keys.push(_columnKey); 
        }
        patientColumnData[_columnKey] = _value;
        emit DataStored(keccak256(abi.encodePacked(_columnKey)), _columnKey, _value);
    }

    //환자의 의료 데이터를 저장하는 함수
    function setPatientData(string memory _columnKey, uint256 _value) public {
        if(patientColumnData[_columnKey] == 0 && bytes(_columnKey).length > 0){
            keys.push(_columnKey);
        }
        patientColumnData[_columnKey] = _value;
        emit DataStored(keccak256(abi.encodePacked(_columnKey)), _columnKey, _value);
    }

    //저장된 키의 총 개수를 반환
    function getKeyLength() public view returns(uint256){
        return keys.length;
    }

    //키에 대해 부분 문자열 매칭(project,userId, column)
    function isMatchedData(string memory _str, string memory _search) public pure returns(bool){
        bytes memory strBytes = bytes(_str);
        bytes memory searchBytes = bytes(_search);
        uint256 searchLength = searchBytes.length;

        uint256 startPos;
        uint256 endPos;
        
        if(searchLength !=5 && searchLength != 7 && searchLength != 3){
            return false;
        }

        if(searchLength == 5) {
            startPos=0; endPos=4;
        }else if(searchLength == 7){
            startPos=6; endPos=12;
        }else if(searchLength ==3){
            startPos=14; endPos=16;
        }
        // require(strBytes.length > endPos, "input string is too short");

        for(uint256 i=startPos; i<=endPos; i++){
            if(searchBytes[i-startPos] != strBytes[i]) return false;
        }

        return true;
    }

    //검색어와 일치하는 환자의 데이터를 페이지 단위로 조회하는 함수
    function searchDataPaged(string memory _search, uint256 _offset, uint256 _limit)
        public view returns(string[] memory, uint256[] memory)
    {
        uint256 len = keys.length;

        //임시 결과 저장용 배열(최대 limit 크기)
        string[] memory tempKeys = new string[](_limit);
        uint256[] memory tempValues = new uint256[](_limit);

        uint256 found = 0; //찾은 결과 수
        uint256 skipped = 0; //offset만큼 건너뛴 결과 수(시작위치)
        
        //모든 키를 순회하며 검색
        for(uint256 i=0; i< len && found < _limit; i++){
            if(isMatchedData(keys[i], _search)){
                //offset만큼 결과 건너뛰기
                if(skipped < _offset){
                    skipped++;
                    continue;
                }

                //결과 저장
                tempKeys[found] = keys[i];
                tempValues[found] = patientColumnData[keys[i]];
                found++;
            }
        }

        //실제 찾을 결과 개수만큼 배열 크기 조정
        string[] memory keyResult = new string[](found);
        uint256[] memory valueResult = new uint256[](found);

        for(uint256 i=0; i<found; i++){
            keyResult[i] = tempKeys[i];
            valueResult[i] = tempValues[i];
        }

        return (keyResult, valueResult);
    }

    // 특정 검색어와 일치하는 데이터의 총 개수를 반환하는 함수
    function getMatchCount(string memory _search) public view returns(uint256){
        uint256 len = keys.length;
        uint256 count = 0;

        for(uint256 i=0; i< len; i++){
            if(isMatchedData(keys[i], _search)){
                count++;
            }
        }
        return count;
    }



}