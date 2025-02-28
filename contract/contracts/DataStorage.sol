// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract DataStorage {
    uint256 public storedValue;

    function storeDecimal(uint256 _val) public{
        storedValue = _val;
    
    }

    function getDecimal() public view returns(uint256){
        return storedValue;
    }

    function getRawValue() public view returns(uint256){
        return storedValue; //내부 저장된 값 확인
    }
  
}
