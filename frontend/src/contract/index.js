import abi from './SwapContractAbi.json';
import ERC20Abi from './ERC20Abi.json';

// real net, avalanche-c chain
var config = {
    contractAbi: abi,
    ERC20Abi: ERC20Abi,

    mainNetUrl: "https://rinkeby.infura.io/v3/",            //Rinkeby RPC
    // mainNetUrl: "https://api.avax.network/ext/bc/C/rpc",     //Avalanch RPC

    chainId: '0x4',    // Rinkeby : '0x4'   
    // chainId: '0xa86a',    // Avalanch : '0xa86a'

    contractAddress: "0x88b62C31313Ecde0BeD1772aa064ac7BcbdfdE4e",      // testing swap contract address
    // contractAddress: "0x5127eb1F70Ae8d6E38a84cCFe7C511ec53aca628",      // swap contract address on Avalanche

    pPOPAddress: "0x0c051B7de800021c8a56ba49A06CC129CaDA30Ce",      // testing presale token
    // pPOPAddress: "0x270ae074bafa4f8b2751363721badc81a09dc0b0",      // presale token on Avalanch

    rPOPAddress: "0xfc30966D42B6074edFaDb50D51b18F278EF32d9B"       // testing real token on Rinkeby
    // rPOPAddress: ""       //  real token on Avalanch

};

export default config; 
