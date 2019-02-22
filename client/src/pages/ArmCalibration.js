import React from "react";
import PropType from "prop-types";

class ArmCalibration extends React.Component {
    static defaultProps = {
        socket: null,
        robotData: null
    }
    constructor(props) {
        super(props);
        this.state = {
            startedTest: false,
            step1Completed: false,
            step2Completed: false,
            step3Completed: false
        }
    }
    render() {
        let {startedTest, step1Completed, step2Completed, step3Completed } = this.state;
        return (
            <div className="arm-calibration-page" onClick={() => this.initTesting()}>
                <div className={startedTest ? "button completed" : "button"}>Start Test</div>
                <div className={startedTest ? (step1Completed ? "button completed" : "button") : "button hidden"} onClick={() => this.completeStep(1)}>Zero</div>
                <div className={step1Completed ? (step2Completed ? "button completed" : "button") : "button hidden"} onClick={() => this.completeStep(2)}>Start Shoulder Test</div>
                <div className={step2Completed ? (step3Completed ? "button completed" : "button") : "button hidden"} onClick={() => this.completeStep(3)}>Start Elbow Test</div>
            </div>
        );
    }

    initTesting = () => {
        let {robotData} = this.props;
        if (!robotData) {
            console.log("Must be connected to the robot");
            return;
        }
        if (!robotData.robotInfo) {
            console.log("Robot not returning Robot Info data");
            return;
        }
        if (!robotData.robotInfo.robotState) {
            console.log("Robot not returning RobotState");
            return;
        }
        let state = robotData.robotInfo.robotState;
        if (state === "test") {
            console.log("Telling robot to start testing");
            this.props.socket.send("Start Arm Calibration");
        }
        else {
            console.log("Must be in test mode and robot must be enabled");
        }
    }

    completeStep = (step) => {
        if (step === 1) {
        }
        else if (step === 2) {

        }
        else if (step === 3) {

        }
    }
}

ArmCalibration.propTypes = {
    socket: PropType.instanceOf(WebSocket),
    robotData: PropType.object
}

export default ArmCalibration;