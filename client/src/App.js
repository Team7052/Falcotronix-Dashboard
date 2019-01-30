import React, { Component } from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";

import "./stylesheets/global.scss";
import Header from './components/Header';
import MotionProfiler from './pages/MotionProfiler';

class App extends Component {
  render() {
    return (
        <Router>
          <div>
            <Header />
            <Route path="/" render={() => <MotionProfiler />}/>
          </div>
        </Router>
    );
  }
}

export default App;
