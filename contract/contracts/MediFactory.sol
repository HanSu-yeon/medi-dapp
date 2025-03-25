// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./Medi.sol";

contract MediFactory {
    //프로젝트명으로 Medi 컨트랙트 매핑
    mapping(string => address) public mediByProject;

    //등록된 프로젝트 이름 목록
    string[] public projectNames;

    //생성된 모든 Medi 컨트랙트 목록
    Medi[] public mediContracts;

    //이벤트 정의
    event MediCreated(string projectName, address contractAddr);

    //새로운 Medi 컨트랙트 생성
    function createMedi(string memory _projectName) public {
        //중복 프로젝트명 체크
        require(mediByProject[_projectName] == address(0), "Project already exists");

        //새 Medi 컨트랙트 생성
        Medi m = new Medi(_projectName);
        
        //매핑 및 배열에 저장
        mediByProject[_projectName] = address(m); //네트워크에 배포된 Medi 컨트랙트의 실제 주소
        projectNames.push(_projectName);
        mediContracts.push(m); //추후 생략하기
        
        //이벤트 발생
        emit MediCreated(_projectName, address(m));
    }

    //프로젝트명으로 Medi 컨트랙트 주소 조회
    function getMediAddress(string memory _projectName) public view returns(address){
        return mediByProject[_projectName];
    }

    function getAllProject() public view returns(string[] memory){
        return projectNames;
    }

    //등록된 컨트랙트 수 반환
    function getContractCount() public view returns(uint256){
        return mediContracts.length;
    }

    //특정 인덱스의 컨트랙트 주소 가져오기
    function getContractAt(uint256 _idx) public view returns(address){
        require(_idx < mediContracts.length, "Index out of bounds");
        return address(mediContracts[_idx]);
    }

    function searchProjectPaged(
        string memory _projectName,
        string memory _search,
        uint256 _offset,
        uint256 _limit
    ) public view returns (
        string[] memory keys,
        uint256[] memory values
    ) {
        address mediAddr = mediByProject[_projectName];
        require(mediAddr != address(0), "Project not found");
        
        Medi m = Medi(mediAddr);
        return m.searchDataPaged(_search, _offset, _limit);
    }

    //모든 컨트랙트에서의 특정 검색어 일치 데이터 총 개수
    function getTotalMatchCount(string memory _search) public view returns(
        uint256 totalMatches,
        uint256 contractsWithMatches
    ){
        totalMatches =0;
        contractsWithMatches =0;

        for(uint256 i=0; i<mediContracts.length; i++){
            Medi m = mediContracts[i];
            uint256 matches =m.getMatchCount(_search);

            if(matches >0){
                totalMatches += matches;
                contractsWithMatches++;
            }
        }

        return (totalMatches, contractsWithMatches);
    }

    // 특정 인덱스의 컨트랙트에서 검색을 수행하는 함수
    function searchAllPaged(
        string memory _search,
        uint256 _targetContractIdx,
         uint256 _dataOffset,
        uint256 _dataLimit
    ) public view returns(
        address source,
        string[] memory keys,
        uint256[] memory values,
        uint256 totalContracts,
        uint256 matchingContracts
    ){
        totalContracts = mediContracts.length;


        if(_targetContractIdx >= mediContracts.length){
            return (address(0), new string[](0), new uint256[](0), totalContracts,0);
        }

        // 지정된 인덱스의 컨트랙트 검색(index가 아닌 프로젝트명으로 바꾸기?)
        Medi m = mediContracts[_targetContractIdx];
        (keys, values) = m.searchDataPaged(_search, _dataOffset, _dataLimit);

        source = address(m);
        //matchingResult로 수정
        matchingContracts = keys.length > 0? 1:0;

        return(source, keys, values, totalContracts, matchingContracts);
    }

}