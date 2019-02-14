import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

var socket = new WebSocket("ws://localhost:8080/endpoint");
        
// Add an event listener for when a connection is open
socket.onopen = function() {
    console.log('WebSocket connection opened. Ready to send messages.');
    
    // Send a message to the server
    socket.send('Hello, from WebSocket client!');
};

// Add an event listener for when a message is received from the server
socket.onmessage = function(message) {
    if (message.data) {
        let json = JSON.parse(message.data);
        console.log(json);
    }
};

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
