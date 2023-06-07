import abi from './SwapContractAbi.json';
import ERC20Abi from './ERC20Abi.json';

// real net, avalanche-c chain
var config = {
    contractAbi: abi,
    ERC20Abi: ERC20Abi,

    mainNetUrl: "https://polygon.llamarpc.com",            //polygon RPC
    // mainNetUrl: "https://data-seed-prebsc-2-s2.binance.org:8545",            //bsc testnet RPC

    chainId: '0x89',    // polygon : '0x89'   
    // chainId: '0x61',    // bsc testnet : '0x97'   

    contractAddress: "0xCcA601EC9D74647d633b28D5aD2380A46c8d9cC8",      // swap contract address
    // contractAddress: "0x4e7F35CfF509D37aF3e5F360a10ff34e293B3014",      // testing swap contract address
  
    broAddress: "0xD09E5aef492DbBe11A74c5d1B20e3e0d19653374",      // presale token
    // broAddress: "0x54E7a996cD74AAbA05f4403B196bde17D1654762",      // testing presale token
};

export default config; 
