import StatefulComponent from "../StatefulComponent";
import { connect } from "react-redux";
import PurchaseForm from "./PurchaseForm";
import {toast} from "react-toastify";
// import PurchaseLimits from "./PurchaseLimits";
// import PurchaseComplete from "./PurchaseComplete";
// mili popup
// import Popup from './Popup/Popup';

class Purchase extends StatefulComponent {
  
  state = {
    isOpen: false,
    presaleRemain: "20000000",
  };

  constructor() {
    super();
    this.handleConnect = this.handleConnect.bind(this); 
  }

  componentDidMount() {
    this.props.dispatch({type:'GET_PRESALE_BALANCE'});
  }

  async handleConnect() {
    if (window.ethereum) {
      await window.ethereum.enable();
      this.props.dispatch({
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
    this.togglePopup();
  }

  togglePopup = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  static getDerivedStateFromProps(props, state) {
    return props;
  }
    render() {
        return (
            <>
                    {/* // this.props.account ?
                        // (this.props.transaction ?
                            // <PurchaseComplete/>
                            // : (this.props.purchaseAllowed ? */}
                                <PurchaseForm />
                                {/* // : <div className="purchase-not-allowed wallet-connection">Your account is not allowed to purchase at this time.</div>))
                        // : */}
                        {/* <div className="wallet-connection selectWallet"> */}
                            {/* <PurchaseLimits/> */}
                            {/* <div><span className="grayish">Sale information</span></div>
                            <div className="wallet-text">
                              {String(this.props.presaleRemain).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')} Tokens remaining.<br></br><br></br>
                              Public sale is open to all. <br></br>
                              NFT or Nest holders can only purchase once.
                            </div> */}
                            {/* {this.state.isOpen && (
                                <Popup
                                    content={
                                    <>
                                        <div className="connectTitle">Connect a wallet</div>
                                        <div className="walletHolder">
                                            <div className="walletItem"><a href="#" onClick={this.handleConnect} ><img alt="MetaMask" src="/img/MetaMask_Fox.png" />MetaMask<span className="arrowRightBtn"><i className="fa-solid fa-chevron-right"></i></span></a></div>                                            
                                        </div>
                                    </>
                                    }
                                    handleClose={this.togglePopup}
                                />
                            )} */}
                        {/* </div> */}
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        transaction : state.transaction,
        account : state.account,
        purchaseAllowed: state.purchaseAllowed,
        presaleRemain: state.presaleRemain
    };
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Purchase);
