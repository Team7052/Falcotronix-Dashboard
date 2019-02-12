import React from "react";
import { LineChart, Line, XAxis, YAxis, Label, Tooltip } from "recharts";
import PhysicsWorld from "../js/PhysicsWorld";
import GraphicsEngine from "../js/GraphicsEngine";
import { ratio, ground, baseOffset, hand } from "../js/PhysicsConstants";

class KinematicsGenerator extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();

        this.physicsWorld = new PhysicsWorld();
        this.state = {
            targetPhysicsCoord: {
                x: -1000,
                y: -1000
            }
        }
    }
    componentDidMount() {
        this.graphicsEngine = new GraphicsEngine(this.canvasRef.current);

        this.redrawPhysicsWorld();
        var socket = new WebSocket("ws://localhost:8080/endpoint");
        
        // Add an event listener for when a connection is open
        socket.onopen = function() {
            console.log('WebSocket connection opened. Ready to send messages.');
            
            // Send a message to the server
            socket.send('Hello, from WebSocket client!');
        };
 
        // Add an event listener for when a message is received from the server
        socket.onmessage = function(message) {
        console.log('Message received from server: ' + message);
        };
    }
    componentDidUpdate() {
        this.redrawPhysicsWorld();
    }
    render() {
        return (
            <div className="kinematics-page page">
                <h1 className="title">Kinematics</h1>
                <canvas className="canvas" ref={this.canvasRef} width={window.innerWidth / 2} height={600} onClick={(e) => this.handleClick(e)}></canvas>
                {/*<div className="graph-visualizer">
                    <LineChart width={800} height={400} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                        <XAxis type="number" dataKey="x">
                            <Label value="Time (ms)" offset={-10} position="insideBottom"></Label>
                        </XAxis>
                        <YAxis type="number" />
                        <Line type="monotone" key="x" dataKey="y" stroke="#8884d8" />
                        <Tooltip wrapperStyle={{ width: 100, backgroundColor: '#ccc' }} />
                    </LineChart>
        </div>*/}
                <div className="animate-button" onClick={this.animate}>Animate</div>
            </div>
        )
    }

    animate = () => {
        let physicsX = this.state.targetPhysicsCoord.x;
        let physicsY = this.state.targetPhysicsCoord.y;

        let displacementProfiles = this.physicsWorld.generateTrajectory(physicsX, physicsY);

        let i = 0;
        let x = setInterval(() => {
            if (i >= displacementProfiles.theta1.length) {
                clearInterval(x);
                return;
            }
            this.physicsWorld.updateWorld(0, displacementProfiles.theta1[i], displacementProfiles.theta2[i], false);
            this.redrawPhysicsWorld();
            i++;
        }, 20)
    }

    handleClick = (e) => {
        if (!this.canvasRef.current) return;
        let canvasX = e.pageX - this.canvasRef.current.offsetLeft;
        let canvasY = e.pageY - this.canvasRef.current.offsetTop;
        let physicsCoord = this.pixelToPhysics({x: canvasX, y: canvasY});
        console.log(physicsCoord.x + "in, " + physicsCoord.y + "in");
        this.setState({
            targetPhysicsCoord: {
                x: physicsCoord.x,
                y: physicsCoord.y
            }
        }, () => this.animate());
    }
    pixelToPhysics = (coordinate) => {
        coordinate.y = this.canvasRef.current.height - coordinate.y - ground * ratio;
        return {
            x: coordinate.x / ratio,
            y: coordinate.y / ratio
        }
    }
    // constants in inches

    redrawPhysicsWorld = () => {
        let ctx = this.graphicsEngine.renderWorld(this.physicsWorld);
        let loc = this.state.targetPhysicsCoord;
        if (loc.x !== -1000) {
            ctx.beginPath();
            ctx.arc((baseOffset + loc.x) * ratio - 10, this.graphicsEngine.convertY(loc.y * ratio), 10, 0 ,360);
            ctx.strokeStyle = "#E1864B";
            ctx.lineWeight = 5.0;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc((baseOffset + loc.x) * ratio - 10, this.graphicsEngine.convertY(loc.y * ratio), 1, 0 ,360);
            ctx.fill();
        }
    }

    transformRect = (rect) => {
        let canvasHeight = this.canvasRef.current.height;
        return { x: rect.x, y: canvasHeight - rect.y - rect.height - this.ground, width: rect.width, height: rect.height };
    }
    transformPoint = (point) => {
        let canvasHeight = this.canvasRef.current.height;
        return { x: point.x, y: canvasHeight - point.y - this.ground}
    }
}
export default KinematicsGenerator;