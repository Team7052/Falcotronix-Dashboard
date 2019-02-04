import React, { Component } from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";

import "./stylesheets/global.scss";
import Header from './components/Header';
import MotionProfiler from './pages/MotionProfiler';
import KinematicsGenerator from "./pages/KinematicsGenerator";

class App extends Component {
  render() {
    return (
        <Router>
          <div>
            <Header />
            <Route exact path="/" render={() => <MotionProfiler />}/>
            <Route path="/kinematics" render={() => <KinematicsGenerator /> } />
          </div>
        </Router>
    );
  }
}

export default App;
