import React from "react";


class Header extends React.Component {
    render() {
        return (
            <header>
                <section className="left-section">
                    <div className="header-title team-red">Falcotronix</div>
                    <div className="header-subtitle team-black">Dashboard</div>
                    <div className="line-separator"></div>
                    <div className="tools-button">Tools</div>
                </section>
                <section className="middle-section">
                    <img className="header-image" src="/logo.png" alt="logo"/>
                </section>
                <section className="right-section">
                    <nav className="navbar">
                        <span>Teleop</span>
                        <span>Auto</span>
                        <span>Practice</span>
                        <span>Test</span>
                    </nav>
                </section>
                
            </header>
        );
    }
}

export default Header;