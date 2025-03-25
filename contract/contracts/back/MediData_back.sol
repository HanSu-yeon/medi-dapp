// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract MediDataStorage {

   //환자별 의료 데이터를 저장하는 매핑(key: "프로젝트명:유저식별자:컬럼명", value: 해당 컬럼 값)
   mapping(string => uint256) public patientColumnData;
   
   //저장된 키 리스트(검색 및 조회용)
   string[] public keys; 
   //이벤트 정의
   event DataStored(bytes32  indexed columnKeyHash, string columnKey, uint256 value);

   constructor() {
        string[29] memory userIDs = [
            "usrid31", "usrid32","usrid33","usrid34","usrid35","usrid36","usrid37","usrid38","usrid39","usrid40",
            "usrid41", "usrid42","usrid43","usrid44","usrid45","usrid46","usrid47","usrid48","usrid49","usrid50"
            "usrid51", "usrid52","usrid53","usrid54","usrid55","usrid56","usrid57","usrid58","usrid59","usrid60"
        ];

        string[10] memory colums = ["cls", "sbp", "tob", "ldl", "adi", "fmh", "tpa", "obs", "alc", "age"];

        uint256[10] memory sampleValues=[uint256(0), 133, 138, 675, 1336, 0, 53, 3129, 3599, 30];

        for(uint256 i=0; i<userIDs.length; i++){
            //각 확자마다 모든 컬럼 초기화
            for(uint256 j=0; j<colums.length; j++){
                string memory key= string(abi.encodePacked("AAAAA:",userIDs[i],":",colums[j]));
                _initialize(key, sampleValues[j]+(i*10));
            }
        }

    }
    //n=5 -> 프로젝트명, n=7 -> 환자 ID 위치, n=3->컬럼명 
    function _initialize(string memory _columnKey, uint256 _value) public {
     

         if (patientColumnData[_columnKey] == 0 && bytes(_columnKey).length >0) {
            keys.push(_columnKey); 
        }
        //환자 데이터를 저장 또는 업데이트
        patientColumnData[_columnKey] = _value;
        // 이벤트 발생 (키의 해시값을 인덱싱)
        emit DataStored(keccak256(abi.encodePacked(_columnKey)), _columnKey, _value);
    }
    
    /**
     * @notice 환자의 의료 데이터를 저장하는 함수
     * @param _columnKey 데이터의 키 (형식: "프로젝트명:유저식별자:컬럼명")
     * @param _value 저장할 의료 데이터 값
     */
    function setPatientData(string memory _columnKey, uint256 _value) public {
        //key가 빈 문자열이 아니면서 기존에 저장된 적이 없으면 keys 배열에 추가
        if (patientColumnData[_columnKey] == 0 && bytes(_columnKey).length >0) {
            keys.push(_columnKey); 
        }
        //환자 데이터를 저장 또는 업데이트
        patientColumnData[_columnKey] = _value;
        // 이벤트 발생 (키의 해시값을 인덱싱)
        emit DataStored(keccak256(abi.encodePacked(_columnKey)), _columnKey, _value);
    }
    
    /**
     * @notice 특정 패턴 기준으로 데이터가 검색어와 일치하는지 확인하는 함수
     * @param _str 비교 대상이 되는 문자열 
     * @param _search 사용자가 검색하려는 문자열
     * @return bool 검색어가 포함되어 있는지 여부
     */
    //검색어와 일치하는게 있는지 확인하는 함수 bool 반환
    //검색어 글자 수: 프로젝트-> 5글자, 유저 식별자 ->7글자, 컬럼명->3글자
    function isMatchedData(string memory _str, string memory _search) public pure returns(bool) {
        bytes memory strBytes = bytes(_str);
        bytes memory searchStr =bytes(_search); 
        uint256 searchLength  = searchStr.length; 

        uint256 startPos;
        uint256 endPos;
        //검색어 길이에 따른 검색 범위 설정 
        //n=5 -> 프로젝트명, n=7 -> 환자 ID 위치, n=3->컬럼명 
        if (searchLength  == 5) { startPos = 0; endPos = 4; } 
        else if (searchLength  == 7) { startPos = 6; endPos = 12; }  
        else if (searchLength  == 3) { startPos = 14; endPos = 16; }  
        else { revert("Unsupported search length"); } //지원되지 않는 검색어 길이
        
        //입력 문자열 길이 체크(검색 범위를 초과하는지 확인) 
        require(strBytes.length > endPos,"input string is too short") ;    
        //해당 범위 내에서 검색어가 일치하는지 비교
       for (uint256 i = startPos; i <= endPos; i++) {
            if(searchStr[i-startPos] != strBytes[i]) return false;
       }
       return true;
    }

    /**
     * @notice 검색어와 일치하는 환자의 데이터를 조회하는 함수
     * @param _search 검색어 (3글자
     * @return keyResult 검색된 키 배열
     * @return valueResult 검색된 값 배열
     */
    //검색어와 일치하는 환자, 값 반환하는 배열
     function searchData(string memory _search) public view returns (string[] memory,uint256[] memory){
        
        uint256 len = keys.length;
        uint256 matchCount=0;

        //검색된 데이터 개수 확인
        for(uint256 i=0; i< len; i++){
            if(isMatchedData(keys[i], _search)){
                matchCount++;
            }    
        }
        
        //검색 결과 배열 생성
        string[] memory keyResult = new string[](matchCount);
        uint256[] memory valueResult = new uint256[](matchCount);
        uint256 count=0;

        //검색어와 일치하는 데이터를 결과 배열에 저장
        for (uint256 i = 0; i < len; i++) {
            if (isMatchedData(keys[i], _search)) {
                keyResult[count] = keys[i];
                valueResult[count] = patientColumnData[keys[i]];
                count++;
                }
        }

        return (keyResult, valueResult);
    } 

}