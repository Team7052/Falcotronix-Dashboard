import React, { Component } from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";

import "./stylesheets/global.scss";
import Header from './components/Header';
import MotionProfiler from './pages/MotionProfiler';
import KinematicsGenerator from "./pages/KinematicsGenerator";
import TrajectoryPage from "./pages/TrajectoryPage";
import ArmCalibration from "./pages/ArmCalibration";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socketConnected: false,
      socketData: null
    }
  }
  componentDidMount() {
    let {socket} = this.props;
    // Add an event listener for when a message is received from the server
    // Add an event listener for when a connection is open
    socket.onopen = () => {
      console.log("Connected");
      this.props.socket.send('Begin Data Stream');
      this.setState({
        socketConnected: true
      })
    };

    socket.onmessage = (message) => {
      if (message.data) {
          let data = message.data;
          try {
            let json = JSON.parse(data);
            this.setState({
              socketData: json
            })
          }
          catch {
            console.log(message.data);
          }
      }
    };
  }
  render() {
    return (
        <Router>
          <div>
            <Header />
            <Route exact path="/" render={() => <MotionProfiler />}/>
            <Route path="/kinematics" render={() => <KinematicsGenerator /> } />
            <Route path="/trajectory" render={() => <TrajectoryPage /> }/>
            <Route path="/calibration" render={() => <ArmCalibration socket={this.props.socket} robotData={this.state.socketData}/> } />
          </div>
        </Router>
    );
  }
}

export default App;
