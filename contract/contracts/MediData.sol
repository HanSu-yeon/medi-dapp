// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract MediDataStorage {
   
    uint256 public storedValue;

    struct UserData{
        //100x 적어주기
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

   mapping(address => UserData) public userRecords; //환자 기록
   mapping(address => uint256) public class;//심장병 유무



    function storeDecimal(uint256 _val) public{
        storedValue = _val;
    
    }

    function getDecimal() public view returns(uint256){
        return storedValue;
    }

    function getRawValue() public view returns(uint256){
        return storedValue; //내부 저장된 값 확인
    }


    //event 추가

    //환자 데이터 저장
    // function storeUserData(uint256 _class,uint256 _sbp, uint256 _tobacco,uint256 _ldl, uint256 _adiposity, uint256 _famhist, uint256 _typea, uint256 _obesity, uint256 _alcohol,uint256 _age ) public {
    //     //환자 데이터     
    //     userRecords[msg.sender] = UserData(_sbp, _tobacco, _ldl,_adiposity,_famhist,_typea, _obesity,_alcohol,_age);
    //     //심장병 유무
    //     class[msg.sender] = _class;
    //     //이벤트
    // }



    //환자 데이터 + 심장병 유무
    function getUserData() public view returns(   UserData memory, uint256) {
        return ( userRecords[msg.sender] , class[msg.sender]);  
    }

    //전체 조회

}