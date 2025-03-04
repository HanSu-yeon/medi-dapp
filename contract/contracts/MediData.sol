// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract MediDataStorage {

    struct UserData{
        //100x 적어주기
        uint256 class; //심장병 유무
        uint256 sbp; //수축기 혈압
        uint256 tobacco; //흡연 여부 or 흡연량
        uint256 ldl; //저밀도 지단백질
        uint256 adiposity; //체지방률(비만도)
        uint256 famhist; //가족력
        uint256 typea; //A형 성격
        uint256 obesity; //비만
        uint256 alcohol; //알코올 섭취 여부 or 섭취량
        uint256 age; //연령
    }

   mapping(address => UserData[]) public userRecords; //환자 기록
   address[] private users; //환자 전체 주소 목록

    event UserDataStored(address indexed user, uint256 indexed class ,uint256  sbp, uint256 tobacco,uint256 ldl, uint256 adiposity, uint256 famhist, uint256 typea, uint256 obesity, uint256 alcohol,uint256 age );

    //환자 데이터 저장
    function storeUserData(uint256 _class,uint256 _sbp, uint256 _tobacco,uint256 _ldl, uint256 _adiposity, uint256 _famhist, uint256 _typea, uint256 _obesity, uint256 _alcohol,uint256 _age ) public {

        if(userRecords[msg.sender].length ==0){
            users.push(msg.sender); //새로운 사용자라면 배열에 추가
        }
        
        //환자 데이터     
       userRecords[msg.sender].push(UserData(_class,_sbp, _tobacco, _ldl,_adiposity,_famhist,_typea, _obesity,_alcohol,_age));
        //이벤트 발생
       emit UserDataStored(msg.sender, _class,_sbp, _tobacco, _ldl,_adiposity,_famhist,_typea, _obesity,_alcohol,_age);
    }


    //환자 데이터 조회
    function getUserData() public view returns(UserData[] memory) {
        return ( userRecords[msg.sender] );  
    }

    //환자 데이터 전체 조회
    // function getAllData() public view returns(address[] memory, UserData[][] memory ){
    //     UserData[][] memory allUserData = new UserData[][](users.length);

    //     for(uint i=0; i < users.length;i++){
    //         allUserData[i] = userRecords[users[i]];
    //     }
    //     return (users,allUserData);
    // }

    //최신데이터 조회
    function getLatestData() public view returns(UserData memory){
        return (userRecords[msg.sender][userRecords[msg.sender].length-1]);
    }

}