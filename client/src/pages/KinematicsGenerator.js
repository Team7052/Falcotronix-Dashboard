import React from "react";
import { LineChart, Line, XAxis, YAxis, Label, Tooltip } from "recharts";

class KinematicsGenerator extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();

        this.state = {
            theta1: 0,
            theta2: 20
        }
        this.ratio = 8;

    }
    componentDidMount() {
        this.updateCanvas();
    }
    componentDidUpdate() {
        this.updateCanvas();
    }
    render() {
        let data = [
            { x: 0, y: 0},
            { x: 400, y: 5}, 
            { x: 1200, y: 5 },
            { x: 1600, y: 0 }
        ];
        return (
            <div className="kinematics-page page">
                <h1 className="title">Kinematics</h1>
                <canvas className="canvas" ref={this.canvasRef} width={800} height={600} onClick={(e) => this.handleClick(e)}></canvas>
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
            </div>
        )
    }

    handleClick = (e) => {
        if (!this.canvasRef.current) return;
        let canvasX = e.pageX - this.canvasRef.current.offsetLeft;
        let canvasY = this.canvasRef.current.offsetHeight - (e.pageY - this.canvasRef.current.offsetTop);
        // physics
        let physicsX = canvasX / this.ratio;
        let physicsY = (canvasY - 30) / this.ratio;

        // linear interpolate between 
        let new_l = physicsX - this.joint1Point.x - this.constants.hand;
        let new_h = this.joint1Point.y - physicsY;

        let current_l = this.joint3Point.x - this.joint1Point.x;
        let current_h = this.joint1Point.y - this.joint3Point.y;

        let points = this.interpolate({l: current_l, h: current_h}, {l: new_l, h: new_h});
        let i = 0;
        let x = setInterval(() => {
            if (i >= points.length) {
                clearInterval(x);
                return;
            }
            this.inverseKinematics(points[i].l, points[i].h);
            i++;
        }, 20)
    }
    interpolate = (currentPos, newPos) => {
        let delta_h = newPos.h - currentPos.h;
        let delta_l = newPos.l - currentPos.l;
        let points = [{l: currentPos.l, h: currentPos.h}];
        let numberOfLines = 20;
        for (let i = 1; i < numberOfLines; i++) {
            let h = currentPos.h + delta_h * (i / numberOfLines);
            let l = currentPos.l + delta_l * (i / numberOfLines);
            points.push({l: l, h: h});
        }
        let differences = [];
        for (let i = 1; i < numberOfLines; i++) {
            differences.push({dx: points[i].l - points[i-1].l, dy: points[i].h - points[i-1].h});
        }


        points.push({l: newPos.l, h: newPos.h});

        this.interpolatedLines = points.map((p) => ({x: p.l, y: p.h}));

        /*let slope = (currentPos.h - newPos.h) / (currentPos.l - newPos.l);
        let b = currentPos.h - currentPos.l * slope;
        let heightAsX = delta_l < delta_h;
        if (heightAsX) {
            slope = (currentPos.l - newPos.l) / (currentPos.h - newPos.h);
            b = currentPos.l - currentPos.h * slope;
        }
        

        let points = [];
        // interpolate
        let initial = heightAsX ? currentPos.h : currentPos.l;
        let final = heightAsX ? newPos.h : newPos.l;

        let incrementor = 1.0;
        if (initial > final) incrementor *= -1;

        for (let i = initial; initial < final ? i < final : i > final; i += incrementor) {
            let x = i;
            if (heightAsX) points.push({h: x, l: x * slope + b});
            else points.push({l: x, h: x * slope + b});
        }
        points.push({l: newPos.l, h: newPos.h});*/
        return points;
    }

    inverseKinematics = (delta_l, delta_h) => {
        // get the delta h and delta l
        let alpha = Math.atan(delta_h / delta_l);
        let p = Math.sqrt(delta_l * delta_l + delta_h * delta_h);
        //console.log(delta_l + " " + delta_h);
        let d1 = this.constants.upperArm, d2 = this.constants.foreArm;
        let theta1 = Math.asin((-Math.pow(d2, 2) + Math.pow(d1, 2) + delta_l * delta_l + delta_h * delta_h) / (2 * d1 * p)) - alpha;
        let theta2 = Math.PI - Math.asin((-Math.pow(d1, 2) + Math.pow(d2, 2) + delta_l * delta_l + delta_h * delta_h) / (2 * d2 * p)) - alpha;
        //console.log(theta1 + " " + theta2);
       // console.log((this.joint3Point.x - this.joint1Point.x) + " " + (this.constants.foreArm + this.constants.upperArm));
        let deg1 = theta1 / Math.PI * 180;
        let deg2 = theta2 / Math.PI * 180;


        this.motionPathPoints.push(this.tipPoint);
        if (deg1 && deg2) {
            this.setState({
                theta1: deg1,
                theta2: deg2
            })
        }

    }

    calculateForwardKinematics() {
        let t1Radians = this.state.theta1 / 180 * Math.PI;
        let t2Radians = this.state.theta2 / 180 * Math.PI;

        this.joint1Point = {x: (this.constants.backToArm + this.constants.thickness / 2), y: this.constants.baseHeight + this.constants.armHeight };
        this.joint2Point = {x: this.joint1Point.x + this.constants.upperArm * Math.sin(t1Radians), y: this.joint1Point.y - this.constants.upperArm * Math.cos(t1Radians)};
        this.joint3Point = {x: this.joint2Point.x + this.constants.foreArm * Math.sin(t2Radians), y: this.joint2Point.y - this.constants.foreArm * Math.cos(t2Radians) }
        this.tipPoint = {x: this.joint3Point.x + this.constants.hand, y: this.joint3Point.y};
    }

    // constants in inches
    constants = {
        baseHeight: 5.29,
        baseWidth: 28,
        armHeight: 35.375,
        upperArm: 27.8125,
        foreArm: 14,
        hand: 4.73,
        thickness: 2,
        backToArm: 17.665
    }
    ground = 30;

    motionPathPoints = [];
    updateCanvas = () => {
        this.calculateForwardKinematics();

        var ctx = this.canvasRef.current && this.canvasRef.current.getContext("2d");
        ctx.clearRect(0,0,this.canvasRef.current.width, this.canvasRef.current.height);

        let t1Radians = this.state.theta1 / 180 * Math.PI;
        let t2Radians = this.state.theta2 / 180 * Math.PI;
        
        if (ctx == null) return;
        let jointCovering = 2.5;
        

        let baseRect = this.transformRect({ x: 0, y: 0, width: this.constants.baseWidth * this.ratio, height: this.constants.baseHeight * this.ratio});
        let armRect = this.transformRect({ x: this.constants.backToArm * this.ratio, y: this.constants.baseHeight * this.ratio, width: this.constants.thickness * this.ratio, height: this.constants.armHeight * this.ratio });
        
        ctx.strokeStyle = "#000000";

        ctx.beginPath();
        // draw ground
        ctx.lineWidth = 3.0;
        let ground = this.transformPoint({x: 0, y: 0}).y;
        ctx.moveTo(0, ground);
        ctx.lineTo(this.canvasRef.current.width, ground);
        ctx.stroke();
        ctx.lineWidth = 1.0;
        // drive base
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.fillStyle = "#222222";
        ctx.fillRect(baseRect.x, baseRect.y, baseRect.width, baseRect.height);
        ctx.rect(armRect.x, armRect.y, armRect.width, armRect.height);
        ctx.stroke();

        let upperArmPoints = [
            this.transformPoint({
                x: (this.joint1Point.x - this.constants.thickness * 0.5 * Math.cos(t1Radians)) * this.ratio,
                y: (this.joint1Point.y - this.constants.thickness * 0.5 * Math.sin(t1Radians)) * this.ratio,
            }),
            this.transformPoint({
                x: (this.joint1Point.x + this.constants.thickness * 0.5 * Math.cos(t1Radians)) * this.ratio,
                y: (this.joint1Point.y + this.constants.thickness * 0.5 * Math.sin(t1Radians)) * this.ratio,
            }),
            this.transformPoint({
                x: (this.joint2Point.x + this.constants.thickness * 0.5 * Math.cos(t1Radians)) * this.ratio,
                y: (this.joint2Point.y + this.constants.thickness * 0.5 * Math.sin(t1Radians)) * this.ratio,
            }),
            this.transformPoint({
                x: (this.joint2Point.x - this.constants.thickness * 0.5 * Math.cos(t1Radians)) * this.ratio,
                y: (this.joint2Point.y - this.constants.thickness * 0.5 * Math.sin(t1Radians)) * this.ratio,
            }),
            this.transformPoint({
                x: (this.joint1Point.x - this.constants.thickness * 0.5 * Math.cos(t1Radians)) * this.ratio,
                y: (this.joint1Point.y - this.constants.thickness * 0.5 * Math.sin(t1Radians)) * this.ratio,
            })
        ]
        ctx.beginPath();
        ctx.moveTo(upperArmPoints[0].x, upperArmPoints[0].y);
        for (let i = 1; i < upperArmPoints.length; i++) {
            ctx.lineTo(upperArmPoints[i].x, upperArmPoints[i].y);
        }
        ctx.fillStyle="#00FF00";
        ctx.fill();

        let forearmPoints = [
            this.transformPoint({
                x: (this.joint2Point.x - this.constants.thickness * 0.5 * Math.cos(t2Radians)) * this.ratio,
                y: (this.joint2Point.y - this.constants.thickness * 0.5 * Math.sin(t2Radians)) * this.ratio,
            }),
            this.transformPoint({
                x: (this.joint2Point.x + this.constants.thickness * 0.5 * Math.cos(t2Radians)) * this.ratio,
                y: (this.joint2Point.y + this.constants.thickness * 0.5 * Math.sin(t2Radians)) * this.ratio,
            }),
            this.transformPoint({
                x: (this.joint3Point.x + this.constants.thickness * 0.5 * Math.cos(t2Radians)) * this.ratio,
                y: (this.joint3Point.y + this.constants.thickness * 0.5 * Math.sin(t2Radians)) * this.ratio,
            }),
            this.transformPoint({
                x: (this.joint3Point.x - this.constants.thickness * 0.5 * Math.cos(t2Radians)) * this.ratio,
                y: (this.joint3Point.y - this.constants.thickness * 0.5 * Math.sin(t2Radians)) * this.ratio,
            }),
            this.transformPoint({
                x: (this.joint2Point.x - this.constants.thickness * 0.5 * Math.cos(t2Radians)) * this.ratio,
                y: (this.joint2Point.y - this.constants.thickness * 0.5 * Math.sin(t2Radians)) * this.ratio,
            })
        ]
        ctx.beginPath();
        ctx.moveTo(forearmPoints[0].x, forearmPoints[0].y);
        for (let i = 1; i < forearmPoints.length; i++) {
            ctx.lineTo(forearmPoints[i].x, forearmPoints[i].y);
        }
        ctx.fillStyle="#FF0000";
        ctx.fill();

        let tipPoints = [
            this.transformPoint({
                x: this.joint3Point.x * this.ratio,
                y: this.joint3Point.y * this.ratio,
            }),
            this.transformPoint({
                x: this.tipPoint.x * this.ratio,
                y: (this.tipPoint.y + this.constants.thickness) * this.ratio
            }),
            this.transformPoint({
                x: this.tipPoint.x * this.ratio,
                y: (this.tipPoint.y - this.constants.thickness) * this.ratio
            }),
            this.transformPoint({
                x: this.joint3Point.x * this.ratio,
                y: this.joint3Point.y * this.ratio,
            }),
        ]
        ctx.beginPath();
        ctx.moveTo(tipPoints[0].x, tipPoints[0].y);
        for (let i = 1; i < tipPoints.length; i++) {
            ctx.lineTo(tipPoints[i].x, tipPoints[i].y);
        }
        ctx.fillStyle="#00FFFF";
        ctx.fill();
        

        let shoulderjoint2Point = this.transformPoint({ x: armRect.x + armRect.width / 2, y: this.constants.baseHeight * this.ratio + this.constants.armHeight * this.ratio});
        let elbowjoint2Point = this.transformPoint({ x: this.joint2Point.x * this.ratio, y: this.joint2Point.y * this.ratio });
        let wristjoint2Point = this.transformPoint({ x: this.joint3Point.x * this.ratio, y: this.joint3Point.y * this.ratio });

        ctx.beginPath();
        ctx.arc(shoulderjoint2Point.x, shoulderjoint2Point.y, jointCovering * this.ratio, 0, 360);
        ctx.arc(elbowjoint2Point.x, elbowjoint2Point.y, jointCovering * this.ratio, 0, 360);
        ctx.fillStyle = "#CCCCCC";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(wristjoint2Point.x, wristjoint2Point.y, jointCovering * this.ratio, 0, 360);
        ctx.fill();

        ctx.beginPath();

        if (this.motionPathPoints.length <= 0) return;
        let originPoint = this.transformPoint({x: this.motionPathPoints[0].x * this.ratio, y: this.motionPathPoints[0].y * this.ratio});
        ctx.moveTo(originPoint.x, originPoint.y);
        for (let point of this.motionPathPoints) {
            let newPoint = this.transformPoint({x: point.x * this.ratio, y: point.y * this.ratio});
            ctx.lineTo(newPoint.x, newPoint.y);
        }
        let last = this.motionPathPoints[this.motionPathPoints.length - 1];
        let lastTransformed = this.transformPoint({x: last.x * this.ratio, y: last.y * this.ratio});
        ctx.lineTo(lastTransformed.x, lastTransformed.y);
        ctx.stroke();
        

        ctx.beginPath();
        for (let point of this.interpolatedLines) {
            let newPoint = this.transformPoint({x: (this.joint1Point.x + point.x) * this.ratio, y: (this.joint1Point.y - point.y) * this.ratio});
            ctx.lineTo(newPoint.x, newPoint.y);
        }
        ctx.strokeStyle = "#0000FF";
        ctx.stroke();
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