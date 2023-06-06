import abi from './SwapContractAbi.json';
import ERC20Abi from './ERC20Abi.json';

// real net, avalanche-c chain
var config = {
    contractAbi: abi,
    ERC20Abi: ERC20Abi,

    mainNetUrl: "https://polygon.llamarpc.com",            //polygon RPC

    chainId: '0x89',    // polygon : '0x4'   

    contractAddress: "0x88b62C31313Ecde0BeD1772aa064ac7BcbdfdE4e",      // testing swap contract address
  
    pPOPAddress: "0xD09E5aef492DbBe11A74c5d1B20e3e0d19653374",      // testing presale token
};

export default config; 
