import { createStore } from 'redux'
import Web3 from 'web3';
import config from '../contract/index';
import { toast } from 'react-toastify';

const _initialState = {
    account: "",
    purchaseAllowed: false,

    name: "Swapsicle",
    imageUrl: "",
    introTitle: "Swap your presale tokens",
    introDescription: "Now you have your pPOPS you can now exchange them for the POPs token that is tradable on swapsicle DEX.",
    purchasedTitle: "Congratulations!",
    purchasedDescription: "Purchase complete. Your pPOP tokens will be immediately sent to your wallet.",
    whitepaperUrl: "/docs/Swapsicle_Whitepaper_v1.2.pdf",
    investToken: "USDC.e",
    investTokenAmount: 0,
    returnToken: "pPOP",
    returnTokenAmout: "",
    minInvest: "$ 100",
    maxInvest: "$ 20,000",
    transaction: "",
    balanceOfPresaleToken: 0,
    balanceOfRealToken: 0

}

const init = (init) => {
    return init;
}

const globalWeb3 = new Web3(config.mainNetUrl);
const provider = Web3.providers.HttpProvider(config.mainNetUrl);
const web3 = new Web3(Web3.givenProvider || provider);

const contract = new web3.eth.Contract(config.contractAbi, config.contractAddress);
const pPOPs = new web3.eth.Contract(config.ERC20Abi, config.pPOPAddress);
const rPOPs  = new web3.eth.Contract(config.ERC20Abi, config.rPOPAddress);

const calcTokenAmount = async (state, investTokenAmount) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }
    try {
        var pPOPDecimals = 18;
        var amount = new web3.utils.toBN(web3.utils.toWei(Number(investTokenAmount).toString(), 'ether'));
        amount = amount.mul(new web3.utils.toBN(Math.pow(10, pPOPDecimals).toString()));
        
        var rPOPDecimals = await rPOPs.methods.decimals().call();
        amount = amount.div(new web3.utils.toBN(Math.pow(10, rPOPDecimals).toString()));
        var tokenAmount = web3.utils.fromWei(amount, 'ether');

        store.dispatch({ type: "RETURN_DATA", payload: { investTokenAmount: investTokenAmount, returnTokenAmount: tokenAmount, returnCoinAmount: tokenAmount } });
    } catch (e) {
        console.log("error: ", e);
        store.dispatch({ type: "RETURN_DATA", payload: { investTokenAmount: 0, returnTokenAmount: 0, returnCoinAmount: 0 } });
    }
}

const swap = async (state, inputAmount) => {    
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }
    try{
        var pPOPBalance = await pPOPs.methods.balanceOf(state.account).call();  
        var pPOPDecimals = 18;
        var allowances =  await pPOPs.methods.allowance(state.account, config.contractAddress).call();
        allowances = web3.utils.toBN(allowances);
        let amount = ""; let pointIdx = inputAmount?.toString().indexOf(".");
        if(pointIdx !== -1)
        {   
            let len = inputAmount.toString().length;
            let m = len - pointIdx - 1;
            let upper = inputAmount.toString().substring(0, pointIdx);
            let lower = inputAmount.toString().substring(pointIdx+1, len);
            upper += lower;

            upper = new web3.utils.toBN(upper);
            amount = upper.mul((new web3.utils.toBN(Math.pow(10, pPOPDecimals - m).toString())));
        }
        else 
        {
            amount = new web3.utils.toBN(inputAmount).mul(new web3.utils.toBN(Math.pow(10, pPOPDecimals).toString()));
            amount = new web3.utils.toBN(amount);
        }
        console.log("pPOPBalance = ", pPOPBalance," amount = ", amount.toString());
        
        if(pPOPBalance - amount >= 0)
        {            
            var amountOut = await contract.methods.getAmountOut(config.pPOPAddress, config.rPOPAddress, amount).call();

            if(allowances - web3.utils.toBN(amount) < 0)
            {
                await pPOPs.methods.approve(config.contractAddress, web3.utils.toWei((2**64-1).toString(),'ether')).send({ from: state.account });
            }
            await contract.methods.swap(config.pPOPAddress, config.rPOPAddress, amount).send({ from: state.account, gas: 3000000 }); 
            
            await getBalanceOfPresaledToken(state);
            await getBalanceOfRealToken(state);

            store.dispatch({
                type: "RETURN_DATA", 
                payload: {
                    investTokenAmount: inputAmount, 
                    returnTokenAmount: globalWeb3.utils.fromWei(amountOut, 'ether'), 
                    returnCoinAmount: globalWeb3.utils.fromWei(amountOut, 'ether'), 
                }
            });           
        }
        else 
        {
            alertMsg("You don't have enough pPOPs.");
            store.dispatch({ type: "RETURN_DATA", payload: {} });
        }
    }catch(e){
        console.log("Error on swap : ", e);
        store.dispatch({ type: "RETURN_DATA", payload: {} });
    }
}

export const getBalanceOfPresaledToken = async (state, flag = true) => {    
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }
    try{
        var pPOPBalance = await pPOPs.methods.balanceOf(state.account).call();     
        pPOPBalance =  globalWeb3.utils.fromWei(pPOPBalance, 'ether');
        console.log("pPOPBalance = ", pPOPBalance);
        store.dispatch({
            type: "UPDATE_PRESALE_TOKEN_BALANCE",
            payload: {
                pPOPBalance,
                flag
            }
        })
    }catch(e){
        console.log("Error on swap : ", e);
        store.dispatch({ type: "RETURN_DATA", payload: {} });
    }    
}

export const getBalanceOfRealToken = async (state) => {    
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }
    try{
        var rPOPBalance = await rPOPs.methods.balanceOf(state.account).call();     
        rPOPBalance =  globalWeb3.utils.fromWei(rPOPBalance, 'ether');
        console.log("rPOPBalance = ", rPOPBalance);
        store.dispatch({
            type: "UPDATE_REAL_TOKEN_BALANCE",
            payload: rPOPBalance
        })
    }catch(e){
        console.log("Error on swap : ", e);
        store.dispatch({ type: "RETURN_DATA", payload: {} });
    }    
}

const reducer = (state = init(_initialState), action) => {
    switch (action.type) {
        case "UPDATE_REAL_TOKEN_BALANCE":
            state = {...state, 
                balanceOfRealToken: action.payload
            };
            break;
        case "UPDATE_PRESALE_TOKEN_BALANCE":  
            if(action.payload.flag === true)
            {                     
                state = {...state, 
                    balanceOfPresaleToken: action.payload.pPOPBalance
                }; 
            }
            else {
                state = {...state, 
                    balanceOfPresaleToken: action.payload.pPOPBalance,
                    investTokenAmount: action.payload.pPOPBalance
                };
                calcTokenAmount(state, action.payload.pPOPBalance);
            }
            break;
        case "GET_BALANCE_OF_REAL_TOKEN":            
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }            
            getBalanceOfRealToken(state);            
            break;
        case "GET_BALANCE_AND_SET_AMOUNT_OF_pPOP_TOKEN":            
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }            
            getBalanceOfPresaledToken(state, false);            
            break;
        case "GET_BALANCE_OF_PRESALED_TOKEN":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }            
            getBalanceOfPresaledToken(state);            
            break;

        case "SWAP_TOKEN":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }            
            swap(state, action.payload.investTokenAmount);
            break;

        case 'CONNECT_WALLET':
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            web3.eth.getAccounts((err, accounts) => {
                store.dispatch({
                    type: 'RETURN_DATA',
                    payload: { account: accounts[0], purchaseAllowed: true, investTokenAmount:0, returnTokenAmount: null, returnCoinAmount: null }
                });
            })
            break;

        case 'GET_TOKEN_AMOUNT':
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            calcTokenAmount(state, action.payload.investTokenAmount);
            break;

        case 'CHANGE_ACCOUNT':
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }              
            state = {...state, 
                investTokenAmount: 0,
                returnTokenAmount: 0,
                returnCoinAmount: 0
            };
            return state;
        case 'RETURN_DATA':
            return Object.assign({}, state, action.payload);

        default:
            break;
    }
    return state;
}

const alertMsg = (msg) => {
    toast.info(msg, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
}

const checkNetwork = (chainId) => {
    if (web3.utils.toHex(chainId) !== web3.utils.toHex(config.chainId)) {
        alertMsg("Change network to Avalanche C Chain!");
        return false;
    } else {
        return true;
    }
}

const changeNetwork = async () => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: config.chainId }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: config.chainId,
                            chainName: 'Avalanche',
                            rpcUrls: [config.mainNetUrl] /* ... */,
                        },
                    ],
                });
            } catch (addError) {
            }
        }
    }
}


if (window.ethereum) {

    window.ethereum.on('accountsChanged', function (accounts) {
        store.dispatch({
            type: "RETURN_DATA",
            payload: { account: accounts[0] }
        });
        store.dispatch({
            type: "CHANGE_ACCOUNT",
            payload: { account: accounts[0] }
        });
    })

    window.ethereum.on('chainChanged', function (chainId) {
        checkNetwork(chainId);
        store.dispatch({
            type: "RETURN_DATA",
            payload: { chainId: chainId }
        });
    });

    web3.eth.getChainId().then((chainId) => {
        checkNetwork(chainId);
        store.dispatch({
            type: "RETURN_DATA",
            payload: { chainId: chainId }
        });
    })
}

const store = createStore(reducer);
export default store