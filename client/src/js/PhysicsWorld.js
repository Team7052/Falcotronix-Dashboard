import {backToArm, thickness, baseHeight, armHeight, upperArm, lowerArm, hand} from "./PhysicsConstants";
class PhysicsWorld {
    /* all measurements in inches, degrees in radians */
    baseX = 0;

    theta1 = 20 / 180 * Math.PI;
    theta2 = 70 / 180 * Math.PI;

    shoulderJoint = {x: 0, y: 0}
    elbowJoint = {x: 0, y: 0}
    wristJoint = {x: 0, y: 0}
    fingerTip = {x: 0, y: 0}
    motionPathPoints = []

    // set limits
    outerArmLimit = {
        x: 0, y: 0, radius: 0
    }

    constructor() {
        // initialize moving parts on the arm
        this.updateWorld(0, this.theta1, this.theta2, false);
    }

    updateWorld(
        baseX = 0,
        theta1 = this.theta1 / Math.PI * 180,
        theta2 = this.theta1 / Math.PI * 180,
        degrees = true)
    {
        if (degrees) {
            this.theta1 = theta1 / 180 * Math.PI;
            this.theta2 = theta2 / 180 * Math.PI;
        }
        else {
            this.theta1 = theta1;
            this.theta2 = theta2;
        }
        this.baseX = baseX;
    
        //forward kinematics for the arm joints
        this.shoulderJoint = {x: (this.baseX + backToArm + thickness / 2), y: baseHeight + armHeight };
        this.elbowJoint = {x: this.shoulderJoint.x + upperArm * Math.sin(this.theta1), y: this.shoulderJoint.y - upperArm * Math.cos(this.theta1)};
        this.wristJoint = {x: this.elbowJoint.x + lowerArm * Math.sin(this.theta2), y: this.elbowJoint.y - lowerArm * Math.cos(this.theta2) }
        this.fingerTip = {x: this.wristJoint.x + hand, y: this.wristJoint.y};
    }

    _interpolate = (currentPos, newPos) => {
        let delta_h = newPos.h - currentPos.h;
        let delta_l = newPos.l - currentPos.l;
        let points = [{l: currentPos.l, h: currentPos.h}];
        let numberOfLines = 20;
        for (let i = 1; i < numberOfLines; i++) {
            let h = currentPos.h + delta_h * (i / numberOfLines);
            let l = currentPos.l + delta_l * (i / numberOfLines);
            points.push({l: l, h: h});
        }
        return points;
    }

    _inverseKinematics = (delta_l, delta_h) => {
        // get the delta h and delta l
        let alpha = Math.atan(delta_h / delta_l);
        if (delta_l < 0) alpha += Math.PI;
        let p = Math.sqrt(delta_l * delta_l + delta_h * delta_h);
        //console.log(delta_l + " " + delta_h);
        let d1 = upperArm, d2 = lowerArm;
        let theta1 = Math.asin((-Math.pow(d2, 2) + Math.pow(d1, 2) + delta_l * delta_l + delta_h * delta_h) / (2 * d1 * p)) - alpha;
        let theta2 = Math.PI - Math.asin((-Math.pow(d1, 2) + Math.pow(d2, 2) + delta_l * delta_l + delta_h * delta_h) / (2 * d2 * p)) - alpha;
        //console.log(theta1 + " " + theta2);
       // console.log((this.wristJoint.x - this.shoulderJoint.x) + " " + (this.lowerArm + this.upperArm));

        this.motionPathPoints.push(this.fingerTip);
        if (theta1 && theta2) {
            return { t1: theta1, t2: theta2 }
        }
    }

    generateTrajectory = (x, y) => {
        // linear interpolate between 
        let new_l = x - this.shoulderJoint.x - hand;
        let new_h = this.shoulderJoint.y - y;

        let current_l = this.wristJoint.x - this.shoulderJoint.x;
        let current_h = this.shoulderJoint.y - this.wristJoint.y;

        let length_height_trajectory = this._interpolate({l: current_l, h: current_h}, {l: new_l, h: new_h});
        let displacementProfiles = this._generateDisplacementProfiles(length_height_trajectory);
        return displacementProfiles;
    }

    _generateDisplacementProfiles = (trajectory) => {
        let profiles = {
            theta1: [],
            theta2: []
        }
        for (let point of trajectory) {
            let angle = this._inverseKinematics(point.l, point.h);
            if (angle) {
                profiles.theta1.push(angle.t1);
                profiles.theta2.push(angle.t2);
            }
        }
        return profiles;
    }

}

export default PhysicsWorld;