import StatefulComponent from "../components/StatefulComponent";
import { Toast } from "../components/common/Toast";
import { Footer } from "../components/common/Footer";
import { connect } from "react-redux";
import ProjectDescription from "../components/invest/ProjectDescription";
import Purchase from "../components/invest/Purchase";

class Home extends StatefulComponent {

    render() {
        return (
            <>
                <div id="main">
                    <Toast/>
                    <section id="HomeHero">
                        <ProjectDescription/>
                        <Purchase/>
                    </section>
                </div>
                <Footer/>
            </>
        );
    }
}


export default connect()(Home);
