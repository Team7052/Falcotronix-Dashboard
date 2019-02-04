import PhysicsWorld from "./PhysicsWorld";
import { ground, ratio, baseHeight, baseWidth, baseOffset, backToArm, thickness, armHeight, jointSize } from "./PhysicsConstants";

class GraphicsEngine {
    driveBaseSystem = {
        baseRect: { x: 0, y: 0, width: 0, height: 0}
    }
    armSystem = {
        armBaseRect: [],
        upperArmCoordinates: [],
        lowerArmCoordinates: [],
        handCoordinates: [],
        shoulderJointArc: {},
        elbowJointArc: {},
        wristJointArc: {},
    }

    constructor(canvas) {
        this.canvas = canvas;
    } 

    renderWorld(physicsWorld: PhysicsWorld) {
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        
        if (ctx == null) return;
        /* set physics limits */
        // outer arm limit
        ctx.beginPath();
        ctx.fillStyle = "#DDDDDD";
        //ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
        ctx.beginPath();
        ctx.fillStyle="#FFFFFF";
        //ctx.arc(physicsWorld.shoulderJoint.x * ratio, this.convertor.canvas.height - (physicsWorld.shoulderJoint.y * ratio) - this.ground, armOuterLimitRadius * ratio, 0, 360);
       // ctx.fill();

        this.drawGround(ctx);
        this.drawDriveBase(ctx, physicsWorld);
        this.drawArm(ctx, physicsWorld);

        // drive base and arm
    
        /* motion path points
        if (this.motionPathPoints.length > 0) {
            /*let originPoint = this.transformPoint({x: this.motionPathPoints[0].x * ratio, y: this.motionPathPoints[0].y * ratio});
            ctx.moveTo(originPoint.x, originPoint.y);
            for (let point of this.motionPathPoints) {
                let newPoint = this.transformPoint({x: point.x * ratio, y: point.y * ratio});
                ctx.lineTo(newPoint.x, newPoint.y);
            }
            let last = this.motionPathPoints[this.motionPathPoints.length - 1];
            let lastTransformed = this.transformPoint({x: last.x * ratio, y: last.y * ratio});
            ctx.lineTo(lastTransformed.x, lastTransformed.y);
            ctx.strokeStyle="#DADADA";
            ctx.stroke();
        }*/

        return ctx;

    }

    convertY(value, height = 0, withGround = true) {
        if (withGround) return this.canvas.height - value - ground * ratio - height;
        return this.canvas.height - value - height;
    }

    drawGround(ctx, convertor) {
        ctx.beginPath();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3.0;
        let convertedGround = this.canvas.height - ground * ratio;
        ctx.moveTo(0, convertedGround);
        ctx.lineTo(this.canvas.width, convertedGround);
        ctx.stroke();
        ctx.closePath();
    }

    drawDriveBase(ctx, physicsWorld: PhysicsWorld) {
        ctx.beginPath();
        ctx.fillStyle = "#222222";
        let height = (baseHeight - baseOffset) * ratio;
        let width = baseWidth * ratio;
        let baseX = physicsWorld.baseX * ratio;
        let baseY = this.convertY(baseOffset * ratio, height);
        ctx.fillRect(baseX, baseY, width, height);
        ctx.stroke();
        ctx.closePath();
    }

    drawArm(ctx, physicsWorld: PhysicsWorld) {
        let width = thickness * ratio;
        let height = armHeight * ratio;
        let armX = (backToArm + physicsWorld.baseX) * ratio;
        let armY = this.convertY(baseHeight * ratio, height);
        ctx.beginPath();
        ctx.fillStyle="#aaaaaa";
        ctx.fillRect(armX, armY, width, height);
        ctx.beginPath();
        ctx.fillStyle = "#666666";
        // upper arm
        ctx.moveTo(
            (physicsWorld.shoulderJoint.x - thickness * 0.5 * Math.cos(physicsWorld.theta1)) * ratio,
            this.convertY((physicsWorld.shoulderJoint.y - thickness * 0.5 * Math.sin(physicsWorld.theta1)) * ratio)
        )
        ctx.lineTo(
            (physicsWorld.shoulderJoint.x + thickness * 0.5 * Math.cos(physicsWorld.theta1)) * ratio,
            this.convertY((physicsWorld.shoulderJoint.y + thickness * 0.5 * Math.sin(physicsWorld.theta1)) * ratio)
        )
        ctx.lineTo(
            (physicsWorld.elbowJoint.x + thickness * 0.5 * Math.cos(physicsWorld.theta1)) * ratio,
            this.convertY((physicsWorld.elbowJoint.y + thickness * 0.5 * Math.sin(physicsWorld.theta1)) * ratio)
        )
        ctx.lineTo(
            (physicsWorld.elbowJoint.x - thickness * 0.5 * Math.cos(physicsWorld.theta1)) * ratio,
            this.convertY((physicsWorld.elbowJoint.y - thickness * 0.5 * Math.sin(physicsWorld.theta1)) * ratio)
        )
        ctx.lineTo(
            (physicsWorld.shoulderJoint.x - thickness * 0.5 * Math.cos(physicsWorld.theta1)) * ratio,
            this.convertY((physicsWorld.shoulderJoint.y - thickness * 0.5 * Math.sin(physicsWorld.theta1)) * ratio)
        )
        ctx.fill();
        // lower arm
        ctx.beginPath();
        ctx.fillStyle="#FF0000";
        ctx.moveTo(
            (physicsWorld.elbowJoint.x - thickness * 0.5 * Math.cos(physicsWorld.theta2)) * ratio,
            this.convertY((physicsWorld.elbowJoint.y - thickness * 0.5 * Math.sin(physicsWorld.theta2)) * ratio),
        );
        ctx.lineTo(
            (physicsWorld.elbowJoint.x + thickness * 0.5 * Math.cos(physicsWorld.theta2)) * ratio, 
            this.convertY((physicsWorld.elbowJoint.y + thickness * 0.5 * Math.sin(physicsWorld.theta2)) * ratio)
        );
        ctx.lineTo(
            (physicsWorld.wristJoint.x + thickness * 0.5 * Math.cos(physicsWorld.theta2)) * ratio,
            this.convertY((physicsWorld.wristJoint.y + thickness * 0.5 * Math.sin(physicsWorld.theta2)) * ratio)
        );
        ctx.lineTo(
            (physicsWorld.wristJoint.x - thickness * 0.5 * Math.cos(physicsWorld.theta2)) * ratio,
            this.convertY((physicsWorld.wristJoint.y - thickness * 0.5 * Math.sin(physicsWorld.theta2)) * ratio)
        );
        ctx.lineTo(
            (physicsWorld.elbowJoint.x - thickness * 0.5 * Math.cos(physicsWorld.theta2)) * ratio,
            this.convertY((physicsWorld.elbowJoint.y - thickness * 0.5 * Math.sin(physicsWorld.theta2)) * ratio)
        );
        ctx.fill();
        ctx.closePath();
        // hand
        ctx.beginPath();
        ctx.moveTo(
            physicsWorld.wristJoint.x * ratio,
            this.convertY(physicsWorld.wristJoint.y * ratio)
        );
        ctx.lineTo(
            physicsWorld.fingerTip.x * ratio,
            this.convertY((physicsWorld.fingerTip.y + thickness) * ratio)
        );
        ctx.lineTo(
            physicsWorld.fingerTip.x * ratio,
            this.convertY((physicsWorld.fingerTip.y - thickness) * ratio)
        );
        ctx.lineTo(
            physicsWorld.wristJoint.x * ratio,
            this.convertY(physicsWorld.wristJoint.y * ratio)
        );
        ctx.fillStyle="#F8C036";
        ctx.fill();

        // draw joints
        ctx.beginPath();
        ctx.fillStyle = "#bcbcbc"
        ctx.arc(physicsWorld.shoulderJoint.x * ratio, this.convertY(physicsWorld.shoulderJoint.y * ratio), jointSize * ratio, 0, 360);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(physicsWorld.elbowJoint.x * ratio, this.convertY(physicsWorld.elbowJoint.y * ratio), jointSize * ratio, 0, 360);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(physicsWorld.wristJoint.x * ratio, this.convertY(physicsWorld.wristJoint.y * ratio), jointSize * ratio, 0, 360);
        ctx.fill();

    }
}

export default GraphicsEngine;