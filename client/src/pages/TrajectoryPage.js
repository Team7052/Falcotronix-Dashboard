import React from "react";
import { COPYFILE_EXCL } from "constants";

class TrajectoryPage extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();

  }

  componentDidMount() {
    this.updateCanvas();
  }

  render() {
    return (
      <div>
        <canvas ref={this.canvasRef}>
          
        </canvas>
      </div>
    )
  }

  updateCanvas() {
    let canvas = this.canvasRef.current;

    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(100000,);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,50);
    ctx.lineTo(300,300);
    ctx.stroke();
  }
}

export default TrajectoryPage;
