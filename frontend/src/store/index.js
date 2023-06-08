import { createStore } from 'redux'
import Web3 from 'web3';
import config from '../contract/index';
import { toast } from 'react-toastify';

const _initialState = {
    account: "",
    purchaseAllowed: false,

    name: "Bromidian",
    imageUrl: "",
    introTitle: "Swap your presale tokens",
    introDescription: "Now you have your MATIC you can now exchange them for the $BRO token that is tradable on Bromidian DEX.",
    purchasedTitle: "Congratulations!",
    purchasedDescription: "Purchase complete. Your BRO tokens will be immediately sent to your wallet.",
    whitepaperUrl: "https://robromides.com/roadmap/",
    investToken: "MATIC",
    investTokenAmount: 0,
    returnToken: "BRO",
    returnTokenAmout: "",
    minInvest: "1 MATIC",
    maxInvest: "1000 MATIC",
    transaction: "",
    balanceOfMatic: 0,
    balanceOfRealToken: 0

}

const init = (init) => {
    return init;
}

const globalWeb3 = new Web3(config.mainNetUrl);
const provider = Web3.providers.HttpProvider(config.mainNetUrl);
const web3 = new Web3(Web3.givenProvider || provider);

const contract = new web3.eth.Contract(config.contractAbi, config.contractAddress);
const bro = new web3.eth.Contract(config.ERC20Abi, config.broAddress);


console.log("provider", config.mainNetUrl);
console.log("contract", config.contractAddress);
console.log("bro", config.broAddress);

const calcTokenAmount = async (state, investTokenAmount) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }
    try {

        console.log("investTokenAmount", investTokenAmount);

        var amount = web3.utils.toWei(Number(investTokenAmount).toString(), 'ether');
        var tokenAmount = await contract.methods.getAmountOut(amount).call();
        tokenAmount = web3.utils.fromWei(tokenAmount,'ether');

        store.dispatch({ type: "RETURN_DATA", payload: { investTokenAmount: investTokenAmount, returnTokenAmount: tokenAmount} });
    } catch (e) {
        console.log("error: ", e);
        store.dispatch({ type: "RETURN_DATA", payload: { investTokenAmount: 0, returnTokenAmount: 0 } });
    }
}

const swap = async (state, inputAmount) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }
    try {

        var maticBalance = await web3.eth.getBalance(state.account);
        maticBalance = web3.utils.fromWei(maticBalance, 'ether');
        var investAmount = web3.utils.toWei(Number(inputAmount).toString(), 'ether');

        console.log("maticBalance = ", maticBalance, " investAmount = ", investAmount, " investAmount = ", inputAmount);

        if (maticBalance - inputAmount >= 0) {
            var amountOut = await contract.methods.getAmountOut(investAmount).call();

            console.log("amountOut", amountOut);

            await contract.methods.swap().send({ from: state.account, gas: 3000000, value:investAmount });

            // await getBalanceOfPresaledToken(state);
            // await getBalanceOfRealToken(state);

            store.dispatch({
                type: "RETURN_DATA",
                payload: {
                    investTokenAmount: inputAmount,
                    returnTokenAmount: globalWeb3.utils.fromWei(amountOut, 'ether'),
                }
            });
        }
        else {
            alertMsg("You don't have enough MATIC.");
            store.dispatch({ type: "RETURN_DATA", payload: {} });
        }
    } catch (e) {
        console.log("Error on swap : ", e);
        store.dispatch({ type: "RETURN_DATA", payload: {} });
    }
}

export const getBalanceOfPresaledToken = async (state, flag = true) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }
    try {
        var maticBalance = await web3.eth.getBalance(state.account);
        maticBalance = web3.utils.fromWei(maticBalance, 'ether');

        console.log("maticBalance = ", maticBalance);
        store.dispatch({
            type: "UPDATE_PRESALE_TOKEN_BALANCE",
            payload: {
                maticBalance,
                flag
            }
        })
    } catch (e) {
        console.log("Error on getBalanceOfPresaledToken : ", e);
        store.dispatch({ type: "RETURN_DATA", payload: {} });
    }
}

export const getBalanceOfRealToken = async (state) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }
    try {
        console.log("account", state.account);

        var rBroBalance = await bro.methods.balanceOf(state.account).call();
        rBroBalance = globalWeb3.utils.fromWei(rBroBalance, 'ether');
        console.log("rBroBalance = ", rBroBalance);

        store.dispatch({
            type: "UPDATE_REAL_TOKEN_BALANCE",
            payload: rBroBalance
        })
    } catch (e) {
        console.log("Error on getBalanceOfRealToken : ", e);
        store.dispatch({ type: "RETURN_DATA", payload: {} });
    }
}

const reducer = (state = init(_initialState), action) => {
    switch (action.type) {
        case "UPDATE_REAL_TOKEN_BALANCE":
            state = {
                ...state,
                balanceOfRealToken: action.payload
            };
            break;
        case "UPDATE_PRESALE_TOKEN_BALANCE":
            if (action.payload.flag === true) {
                state = {
                    ...state,
                    balanceOfMatic: action.payload.maticBalance
                };
            }
            else {
                state = {
                    ...state,
                    balanceOfMatic: action.payload.maticBalance,
                    investTokenAmount: action.payload.maticBalance
                };
                calcTokenAmount(state, action.payload.maticBalance);
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
                    payload: { account: accounts[0], purchaseAllowed: true, investTokenAmount: 0, returnTokenAmount: null}
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
            state = {
                ...state,
                investTokenAmount: 0,
                returnTokenAmount: 0,
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
        alertMsg("Change network to Polygon Mainnet!");
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