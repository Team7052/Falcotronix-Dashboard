import React from "react";
import { LineChart, Line, XAxis, YAxis, Label, Tooltip } from "recharts";

class MotionProfiler extends React.Component {
    render() {
        let data = [
            { x: 0, y: 0},
            { x: 400, y: 5}, 
            { x: 1200, y: 5 },
            { x: 1600, y: 0 }
        ];
        return (
            <div className="motion-profiler-page page">
                <h1 className="title">Motion Profiler</h1>
                <div className="side-panel">
                    <h2 className="title">Saved</h2>
                </div>
                <div className="chart-visualizer">
                    <LineChart width={800} height={400} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                        <XAxis type="number" dataKey="x">
                            <Label value="Time (ms)" offset={-10} position="insideBottom"></Label>
                        </XAxis>
                        <YAxis type="number" />
                        <Line type="monotone" key="x" dataKey="y" stroke="#8884d8" />
                        <Tooltip wrapperStyle={{ width: 100, backgroundColor: '#ccc' }} />
                    </LineChart>
                </div>
            </div>
        )
    }
}
export default MotionProfiler;