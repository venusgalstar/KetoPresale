// import StatefulComponent from "../StatefulComponent";
import { useDispatch, useSelector } from "react-redux";
import PurchaseLimits from "./PurchaseLimits";
import { toast } from "react-toastify";
import Popup from './Popup/Popup';
import { useEffect, useState } from "react";

const PurchaseForm = () => {
    const [invest, setInvestAmount] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const dispatch = useDispatch();
    const account = useSelector(state => state.account);
    const returnTokenAmount = useSelector(state => state.returnTokenAmount);
    const investTokenAmount = useSelector(state => state.investTokenAmount);
    const balanceOfMatic = useSelector(state => state.balanceOfMatic);
    const balanceOfRealToken = useSelector(state => state.balanceOfRealToken);

    console.log(balanceOfMatic);

    const swap = () => {
        if(Number(invest) > 0) dispatch({ type: "SWAP_TOKEN", payload: { investTokenAmount: invest } });
        else {            
            toast.info('Input value must be bigger than zero.', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }

    const handleChange = (event) => {
        setInvestAmount(event.target.value);
        if(Number(event.target.value) > 0){
            dispatch({
                type: 'GET_TOKEN_AMOUNT', payload: { investTokenAmount: event.target.value }
            });
        }else{
            dispatch({
                type: 'GET_TOKEN_AMOUNT', payload: { investTokenAmount: 0 }
            });
        }
    }

    const handleConnect = async () => {
        if (window.ethereum) {
            await window.ethereum.enable();
            dispatch({
                type: 'CONNECT_WALLET',
            });
        } else {
            toast.info('Please install metamask on your device', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
        togglePopup();
    }

    const togglePopup = () => {
        setIsOpen(!isOpen);
    };

    const onClickMAX = () => {
        dispatch({ type: "GET_BALANCE_AND_SET_AMOUNT_OF_pPOP_TOKEN", payload: {} });
    }

    useEffect(() => {
        if (investTokenAmount >= 0) setInvestAmount(investTokenAmount);
    }, [investTokenAmount])

    useEffect(() => {
        if(account)
        {            
            setTimeout(() => {
                dispatch({ type: "GET_BALANCE_OF_PRESALED_TOKEN", payload: {} });
                dispatch({ type: "GET_BALANCE_OF_REAL_TOKEN", payload: {} });
            }, [500])
        }
    }, [account, dispatch]);

    return (
        <>
            <div className="purchase-form wallet-connection" >
                <div className="purchase-amount">
                    {
                        account ?
                            <div className="account-address">{account.slice(0, 6) + "..." + account.slice(38)}</div>
                            :
                            <button onClick={() => togglePopup()} className="connectWallet">Connect wallet to swap</button>
                    }
                    <div className="newInputs">
                        <div className="leftInputs NewHolder">
                            <div className="amoutToken">
                                <label>From</label>                                    
                                { 
                                balanceOfMatic >= 0 ?
                                    <span>Balance : {balanceOfMatic}</span>
                                    :
                                    <span>Balance : 0 </span>
                                }
                            </div>
                            <div className="newInputsItem">
                                {/* <input className={returnCoinAmount > 0 ? "input-warning active" : "input-warning"} type="text" placeholder="1000" */}
                                {
                                    account ?
                                        <input className="input-warning " type="text" placeholder="0"
                                            value={invest ?? ""}
                                            onChange={(e) => handleChange(e)} />
                                        :
                                        <input className="input-warning " type="text" placeholder="0"
                                            value={invest ?? ""}
                                            onChange={(e) => handleChange(e)} disabled />
                                }
                                <span className="max_button" onClick={() => onClickMAX()}>MAX</span>
                                <button className="selectDinar">
                                    <div className="optionDinar" >
                                        <div className="imageDinar"><img alt="USDC.e" src="/img/matic.png" /></div>
                                    </div>
                                    <div className="">MATIC</div>
                                </button>
                            </div>
                            <PurchaseLimits compact={true} />
                        </div>

                        <div className="rightInputs NewHolder">

                            <div className="amoutToken">
                                <label>To</label>
                                { 
                                balanceOfRealToken >= 0 ?
                                    <span>Balance : {balanceOfRealToken}</span>
                                    :
                                    <span>Balance : 0 </span>
                                }
                            </div>
                            <div className="newInputsItem">
                                <input className="disablePointer" type="text" placeholder="Autofill"
                                    value={returnTokenAmount ?? "Autofill"} onChange={() => { }} readOnly />
                                <button className="selectDinar">
                                    <div className="optionDinar" >
                                        <div className="imageDinar"><img src="/img/logo.png" alt="Bro token" /></div>
                                    </div>
                                    <div className="">BRO</div>
                                </button>
                            </div>
                        </div>

                    </div>
                    <button className="connectWallet" onClick={() => swap()}>Swap</button>
                </div>
                {isOpen && (
                    <Popup
                        content={
                            <>
                                <div className="connectTitle">Connect a wallet</div>
                                <div className="walletHolder">
                                    <div className="walletItem"><a onClick={() => handleConnect()} href="#root" ><img alt="MetaMask" src="/img/MetaMask_Fox.png" />MetaMask<span className="arrowRightBtn"><i className="fa-solid fa-chevron-right"></i></span></a></div>
                                </div>
                            </>
                        }
                        handleClose={() => togglePopup()}
                    />
                )}
            </div>
        </>
    );
}

export default PurchaseForm;