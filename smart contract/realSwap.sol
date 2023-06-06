// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract realSwap is Ownable {

    using SafeMath for uint256;

    uint8 pauseContract = 0;
    ERC20 presaleToken;
    ERC20 realToken;
    address presaledTokenAddress;
    address realTokenAddress;

    event Received(address, uint);
    event Fallback(address, uint);
    event SetContractStatus(address addr, uint256 pauseValue);
    event ChangePresaledTokenAddress(address owner, address newAddr);
    event WithdrawAll(address addr, uint256 token, uint256 native);
    event ChangeRealTokenAddress(address owner, address newAddr);
    event Swapped(address Atoken, address Btoken, uint256 amountIn, uint256 amountOut);
    
    constructor() 
    {          
        presaledTokenAddress = address(0x0c051B7de800021c8a56ba49A06CC129CaDA30Ce);
        realTokenAddress = address(0xfc30966D42B6074edFaDb50D51b18F278EF32d9B);
        presaleToken = ERC20(presaledTokenAddress);
        realToken = ERC20(realTokenAddress);
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
    
    function getPresaleTokenAddress() public view returns(address){
        return presaledTokenAddress;
    }

    function setPresaledTokenAddress(address _addr) external onlyOwner {
        require(pauseContract == 0, "Contract Paused");
        presaledTokenAddress = _addr;
        presaleToken = ERC20(presaledTokenAddress);
        emit ChangePresaledTokenAddress(msg.sender, presaledTokenAddress);
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

    function swap(address _Atoken, address _Btoken, uint256 _amountIn) public {        
        require(pauseContract == 0, "Contract Paused");
        require(_Atoken == presaledTokenAddress, "Invalid input token address.");
        require(_Btoken == realTokenAddress, "Invalid output token address.");
        require(_amountIn > 0 , "Invalid amount.");
        require(presaleToken.balanceOf(address(msg.sender)).sub(_amountIn) >= 0 , "Insufficient presaled tokens.");

        uint8 pDecimals = presaleToken.decimals();
        uint8 rDecimals = realToken.decimals();
        uint256 amountOut = _amountIn.mul(10 ** rDecimals).div(10 ** pDecimals);

        require(realToken.balanceOf(address(this)).sub(amountOut) >= 0 , "Sorry, insufficient real tokens.");
        
        presaleToken.transferFrom(msg.sender, address(this), _amountIn);  
        realToken.transfer(msg.sender, amountOut);

        emit Swapped(_Atoken, _Btoken, _amountIn, amountOut);
    }

    function getAmountOut(address _Atoken, address _Btoken, uint256 _amountIn) public view returns(uint256) {        
        require(_Atoken == presaledTokenAddress, "Invalid input token address.");
        require(_Btoken == realTokenAddress, "Invalid output token address.");
        require(_amountIn > 0 , "Invalid amount.");
        
        uint8 pDecimals = presaleToken.decimals();
        uint8 rDecimals = realToken.decimals();
        uint256 amountOut = _amountIn.mul(10 ** rDecimals).div(10 ** pDecimals);

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

