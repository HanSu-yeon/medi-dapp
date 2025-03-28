// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

//MediSystem 책임
//Medi 생성 요청 -> MediFactory에 위임
//합성 의료 데이터 업로드 -> Medi에 저장
//프로젝트 참여 참조 기록 -> User에 남기기
//공개 데이터 검색 -> MediFactory 통해 Medi 탐색색

import "./Medi.sol";
import "./MediFactory.sol";
import "./User.sol";

contract MediSystem{
    // Medifactory 주소
    address public factoryAddr;
    // 사용자 관리 userId=>User address
    mapping(string => address) public users;

    event UserRegistered(string _userId, address _userAddr);
    event ProjectCreated(string _projectName, address _mediAddr);
    event SyntheticDataStored(string _projectName, string _columnKey, uint256 _value);

    constructor(address _factoryAddr){
        factoryAddr = _factoryAddr;
    }


    //사용자 등록（실제 유저만 생성）
    function registerUser(string memory _userId) external {
        //사용자 존재하는지 확인
        require(users[_userId] == address(0), "User already exists");
        User user = new User(_userId);
        users[_userId] = address(user);
        emit UserRegistered(_userId, address(user));
    }

    //사용자 조회
    function getUser(string memory _userId) public view returns(address){
        return users[_userId];
    }   

    //Medi 프로젝트 생성(위임)
    function createProject(string memory _projectName) public{
        MediFactory(factoryAddr).createMedi(_projectName);
        address mediAddr = MediFactory(factoryAddr).getMediAddress(_projectName);
        emit ProjectCreated(_projectName, mediAddr);
    }

    //합성 데이터 등록
    function submitSyntheticData(
        string memory _projectName,
        string[] memory _userIds,
        string[] memory _columnKeys,
        uint256[] memory _values,

    ) public {
        require(
            _columnKeys.length == _values.length &&
            _values.length == _userIds.length &&
            _userIds.length == _dataHashes.length,
            "Array length mismatch"
        );

        address mediAddr = MediFactory(factoryAddr).getMediAddress(_projectName);
        require(mediAddr != address(0), "Project not found");
        //형변환: 주소(address)를 Medi 컨트랙트 인스턴스로 바꿔줌
        //medi를 통해 set~ 등 Medi함수 호출 가능
        Medi medi = Medi(mediAddr);
        //모든 데이터(=합성 데이터 row들)에 대해 반복복
        for(uint256 i=0; i<_columnKeys.length; i++){
            medi.setPatientData(_columnKeys[i],_values[i]); //medi 컨트랙트에 저장
            emit SyntheticDataStored(_projectName, _columnKeys[i],_values[i]);//이벤트 발생-> 블록체인 로그에 기록됨 
            //해당 컬럼키가 어떤 사용자(userId)의 데이터인지 확인 -> 그 사용자의 User 컨트랙트 주소 가져오기기
            address userAddr = users[_userIds[i]];
            //사용자 컨트랙트가 있는 경우에만 기록 남기기(등록 안된 사용자일수도 있기 때문문)
            if(userAddr != address(0)){
                //User 컨트랙트에 연결된 의료 기록 참조 남기기(나한테 어떤 등록데이터가 등록됐는가 이력남기는 용도도)
               User(userAddr).linkProjectRecord(_projectName, _columnKeys[i],_dataHashes[i]);
            }

        }

    }


    //통합 공개 데이터 검색
    function searchPublicData(string memory _search, uint256 _offset, uint256 _limit) public view returns(string[] memory, uint256[] memory){
        
        return MediFactory(factoryAddr).searchAllPaged(_search, _offset, _limit);
    }

    function getFirstMatch(string memory _search)public view returns(
        address source,
        string[] memory keys,
        uint256[] memory values
    ){
        return MediFactory(factoryAddr).searchFirstMatch(_search);
    }

    function getTotalMatchCount(string memory _search)public view returns(uint256){
        return MediFactory(factoryAddr).getTotalMatchCount(_search);
    }
}