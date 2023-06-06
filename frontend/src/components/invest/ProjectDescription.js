import StatefulComponent from "../StatefulComponent";
import { connect } from "react-redux";

class ProjectDescription extends StatefulComponent {
    render() {
        return (
            <>
                <div className="project-description">
                    {
                        this.props.imageUrl ?
                            <div className="project-image"><img src={this.props.imageUrl} alt={this.props.name}/></div>
                            : (!this.props.name ? <></> :
                                 <div className="project-name">{/* this.props.name */}</div>)
                    }

                    <div className="project-title">{
                        this.props.account && this.props.transaction ?
                            this.props.purchasedTitle : this.props.introTitle
                    }</div>
                    <div className="project-description-text">{
                        this.props.account && this.props.transaction ?
                            this.props.purchasedDescription : this.props.introDescription
                    }</div>
                    {
                        !this.props.whitepaperUrl ? <></> :
                        <div><a className="whitePpr" href={this.props.whitepaperUrl} target="_blank" rel="noreferrer">Read our whitepaper <span className="arrowRightBtn"><i className="fa-solid fa-chevron-right"></i></span></a></div>
                    }
                </div>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        account : state.account,
        transaction: state.transaction,
        name : state.name,
        imageUrl : state.imageUrl,
        introTitle : state.introTitle,
        introDescription : state.introDescription,
        purchasedTitle: state.purchasedTitle,
        purchasedDescription : state.purchasedDescription,
        whitepaperUrl : state.whitepaperUrl
    };
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDescription);
