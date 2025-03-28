// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./Medi.sol";

contract MediFactory {
    
    mapping(string => address) public mediByProject; //프로젝트명으로 Medi 컨트랙트 매핑
    string[] public projectNames; //등록된 프로젝트 이름 목록
    Medi[] public mediContracts;  //생성된 모든 Medi 컨트랙트 목록

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
        mediContracts.push(m);
        
        //이벤트 발생
        emit MediCreated(_projectName, address(m));
    }

    //프로젝트명으로 Medi 주소 반환
    function getMediAddress(string memory _projectName) public view returns(address){
        return mediByProject[_projectName];
    }
    //전체 프로젝트명 리스트 
    function getAllProject() public view returns(string[] memory){
        return projectNames;
    }

    //등록된 Medi 컨트랙트 개수
    function getContractCount() public view returns(uint256){
        return mediContracts.length;
    }

    //인덱스 기반 Medi 주소
    function getContractAt(uint256 _idx) public view returns(address){
        require(_idx < mediContracts.length, "Index out of range");
        return address(mediContracts[_idx]);
    }

    // 모든 Medi에서 검색어에 해당하는 데이터 페이징 조회
  /**   function searchAllPaged(
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

*/
    // 모든 Medi에서 검색어에 해당하는 데이터 페이징 조회
    //함수 목적: MediFactory가 가지고 있는 모든 Medi 컨트랙트들 안에서 검색어에 해당하는 
    //데이터를 모아서 일정 개수만큼(limit) 페이지 단위로 보여주기 위한 함수
    function searchAllPaged(
        string memory _search,
         uint256 _offset,
        uint256 _limit
    ) public view returns(
        string[] memory keys,
        uint256[] memory values
    ){
        //임시로 최대 _limit만큼의 공간 준비
        string[] memory tempKeys = new string[](_limit);
        uint256[] memory tempValues = new uint256[](_limit);

        uint256 found = 0;
        uint256 skipped = 0; 

        //각 Medi에 대해 검색 결과 받아옴
        //건너뛴 것(skip) + 최대 개수(limit) 기준으로 모아서 결과 배열을 만들어서 리턴
        //(참고로 여기서 0, _limit + _offset 하는 건 여유 있게 데이터를 받기 위함)
        for(uint256 i=0; i<mediContracts.length && found < _limit; i++){
            Medi m = mediContracts[i];
            (string[] memory k, uint256[] memory v) = m.searchDataPaged(_search,0 , _limit+_offset);
            //전체 데이터 중에서 offset만큼은 건너뛰고 시작작
            for(uint256 j=0; j<k.length && found < _limit; j++){
                if(skipped < _offset){
                    skipped++;
                    continue;
                }
                //그 후 데이터를 결과 배열에 담기 시작작
                tempKeys[found] = k[j];
                tempValues[found]=v[j];
                found++;
            }
        }
        //딱 필요한 개수만큼 실제 결과 배열을 만들어서서
        keys = new string[](found);
        values = new uint256[](found);
        //복사해서 리턴하는 구조
        for(uint256 i=0; i<found;i++){
            keys[i] =tempKeys[i];
            values[i] = tempValues[i];
        }
        
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
    // function getTotalMatchCount(string memory _search) public view returns(
    //     uint256 totalMatches,
    //     uint256 contractsWithMatches
    // ){
    //     totalMatches =0;
    //     contractsWithMatches =0;

    //     for(uint256 i=0; i<mediContracts.length; i++){
    //         Medi m = mediContracts[i];
    //         uint256 matches =m.getMatchCount(_search);

    //         if(matches >0){
    //             totalMatches += matches;
    //             contractsWithMatches++;
    //         }
    //     }

    //     return (totalMatches, contractsWithMatches);
    // }


    //모든 Medi에서 검색어에 해당하는 데이터 개수 합산
    function getTotalMatchCount(string memory _search) public view returns(uint256 totalCount){
        totalCount = 0;
        for(uint256 i =0; i<mediContracts.length; i++){
            totalCount +=mediContracts[i].getMatchCount(_search);
        }
    }

    //첫 번째 Medi만 찾는 함수(유즈케이스에 따라 선택하기)
    function searchFirstMatch(
        string memory _search
    ) public view returns(
        address source,
        string[] memory,
        uint256[] memory
    ){
        for(uint256 i=0; i< mediContracts.length; i++){
            Medi m = mediContracts[i];
            (string[] memory keys, uint256[] memory values) = m.searchDataPaged(_search, 0, 1);
            if(keys.length > 0){
                return (address(m), keys, values);
            }
        }
        //결과 없을 경우 아래처럼 반환 -> 왜? 형식 맞추기 위해서서
        //address : 아무것도 아닌 주소 (0x000...000) = "결과 없음"
        //new string: 길이 0인 문자열 배열 = "key 없음"
        //new uint256: 길이 0인 숫자 배열 = "값 없음"
        return (address(0), new string[](0), new uint256[](0) ); //값이 없는 상태로 초기화된 반환
    }
    

}