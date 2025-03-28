// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

//개인 데이터, 프로젝트 참여기록 관리

contract User {

    string public userId;
    address public owner;
    bool public isActive;
    uint256 private createdAt;
    uint256 private lastUpdated;
    
    //recordType도 넣을까나-> 일단 합성만이니 보류
    
    struct MedicalRecord{
        uint256 timestamp;
        string projectName;
        string recordKey; // dataReference
        bytes32 dataHash;
        bool isSynthetic;
    }

    //모든 의료 기록 저장하는 배열
    MedicalRecord[] public medicalRecordHistory;
    mapping(string=> uint256[]) public recordIndexByProject;

    event RecordAdded(uint256 timestamp, string projectName, string recordKey);
    event UserStatusChanged(bool isActive);

    constructor(string memory _userId){
        userId = _userId;
        owner = msg.sender;
        createdAt = block.timestamp;
        lastUpdated = block.timestamp;
    }

    modifier onlyOwner(){
        require(owner == msg.sender, "Only owner can modify user data");
        _;
    }
    
    //유저가 자신의 의료 기록 등록(개인 건강)
    function addMedicalRecord(string memory _projectName, string memory _recordKey,bytes32 _dataHash, bool _isSynthetic) 
    public onlyOwner {
        uint256 timestamp = block.timestamp;

     
        MedicalRecord memory newRecord = MedicalRecord({
            timestamp: timestamp,
            projectName: _projectName,
            recordKey: _recordKey,
            dataHash: _dataHash,
            isSynthetic: _isSynthetic
        });
        medicalRecordHistory.push(newRecord);
        /**
         * 위 코드를 하나로 합치면 이렇게
            medicalHistory.push(MedicalRecord({
            timestamp: timestamp,
            projectName: _projectName,
            recordKey: _recordKey,
            dataHash: _dataHash,
            isSynthetic: _isSynthetic
        }));
         */

        uint256 index = medicalRecordHistory.length - 1;
        recordIndexByProject[_projectName].push(index);
        lastUpdated = timestamp;

        emit RecordAdded(timestamp, _projectName, _recordKey);
    }

    //합성 데이터일 경우 외부에서 참조만 남김
    function linkProjectRecord(
        string memory _projectName,
        string memory _recordKey,
        bytes32 _dataHash
    ) public {
        //require(isActive, "User inactive");
        medicalRecordHistory.push(MedicalRecord({
            timestamp: block.timestamp,
            projectName: _projectName,
            recordKey: _recordKey,
            dataHash: _dataHash,
            isSynthetic: true
        }));

        recordIndexByProject[_projectName].push(medicalRecordHistory.length -1);
        lastUpdated = block.timestamp;
        emit RecordAdded(block.timestamp, _projectName, _recordKey);

    }
    //사용자 활성/비활성 상태 전환
    function setActive(bool _isActive) public onlyOwner{
        isActive = _isActive;
        lastUpdated = block.timestamp;
        emit UserStatusChanged(_isActive);
    }

    //전체 의료 기록 조회
    function getMedicalRecords() public view returns(MedicalRecord[] memory){
        return medicalRecordHistory;
    }

    //총 의료기록 개수
    function getMedicalRecordCount() public view returns(uint256){
        return medicalRecordHistory.length;
    }
    //특정 프로젝트 기준으로 필터링
    function getMedicalIndicesByProject(string memory _projectName) public view returns (uint256[] memory){
        return recordIndexByProject[_projectName];
    }

    function getMedicalRecord(uint256 index) public view returns(MedicalRecord memory){
        require(index<medicalRecordHistory.length, "Index out of bounds");
        return medicalRecordHistory[index];
    }
    //getRecentMedicalRecords #최근 의료 기록 조회
    
    //데이터 무결성 검증
    function verifyDataHash(string memory _key, uint256 _value) public view returns(bool){
        
        for(uint256 i=0; i<medicalRecordHistory.length; i++){
            if(medicalRecordHistory[i].dataHash ==keccak256(abi.encodePacked(_key, _value)) ){
                return true;
            }
        }
        return false;
    }

    
}