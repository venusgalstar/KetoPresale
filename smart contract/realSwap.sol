// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract realSwap is Ownable {

    using SafeMath for uint256;

    uint8 pauseContract = 0;
    ERC20 realToken;
    address realTokenAddress;
    uint256 swapRate;

    address managerWallet = 0x79CA15110241605AE97F73583F5C3f140506fb80;

    event Received(address, uint);
    event Fallback(address, uint);
    event SetContractStatus(address addr, uint256 pauseValue);
    event ChangePresaledTokenAddress(address owner, address newAddr);
    event WithdrawAll(address addr, uint256 token, uint256 native);
    event ChangeRealTokenAddress(address owner, address newAddr);
    event Swapped(uint256 amountIn, uint256 amountOut);
    
    constructor() 
    {          
        realTokenAddress = address(0xD09E5aef492DbBe11A74c5d1B20e3e0d19653374);
        realToken = ERC20(realTokenAddress);
        swapRate = 500;
    }
    
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    fallback() external payable { 
        emit Fallback(msg.sender, msg.value);
    }

    function getContractStatus() public view returns (uint8) {
        return pauseContract;
    }

    function setContractStatus(uint8 _newPauseContract) external onlyOwner {
        pauseContract = _newPauseContract;
        emit SetContractStatus(msg.sender, _newPauseContract);
    }

    function getRealTokenAddress() public view returns(address){
        return realTokenAddress;
    }

    function setRealTokenAddress(address _addr) external onlyOwner {
        require(pauseContract == 0, "Contract Paused");
        realTokenAddress = _addr;
        realToken = ERC20(realTokenAddress);
        emit ChangeRealTokenAddress(msg.sender, realTokenAddress);
    }

    function getSwapRate() external view returns(uint256){
        return swapRate;
    }

    function setSwapRate(uint256 _newSwapRate) external onlyOwner{
        swapRate = _newSwapRate;
    }

    function getManagerWallet() external view returns(address){
        return managerWallet;
    }

    function setManagerWallet(address _newWallet) external onlyOwner{
        managerWallet = _newWallet;
    }

    function swap() public payable{        
        require(pauseContract == 0, "Contract Paused");
        
        uint256 amountOut = msg.value * swapRate;

        require(realToken.balanceOf(address(this)).sub(amountOut) >= 0 , "Sorry, insufficient real tokens.");
        
        payable(managerWallet).transfer(msg.value);
        realToken.transfer(msg.sender, amountOut);

        emit Swapped(msg.value, amountOut);
    }

    function getAmountOut(uint256 _amountIn) public view returns(uint256) {    
        require(_amountIn > 0 , "Invalid amount.");

        uint256 amountOut = _amountIn * swapRate;

        return amountOut;
    }

    function withdrawAll(address _addr) external onlyOwner{
        uint256 balance = ERC20(_addr).balanceOf(address(this));
        if(balance > 0) {
            ERC20(_addr).transfer(msg.sender, balance);
        }
        address payable mine = payable(msg.sender);
        if(address(this).balance > 0) {
            mine.transfer(address(this).balance);
        }
        emit WithdrawAll(msg.sender, balance, address(this).balance);
    }
}

