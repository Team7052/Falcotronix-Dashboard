package com.example.socketserver.calibration;

/*
    In a calibration procedure, the following steps take place:
        1) The client initiates calibration.
        2) The server determines whether or not calibration takes place at this time
        3) If calibration can take place, initialize calibration on a new thread
        4) The robot changes its state to perform calibration only, server confirms to client that calibration is starting
        5) Once communication is established and ready, the following steps occur:
            5.1) Client sends task to be performed to server
            5.2) Server asks robot for information, robot will give a response
            5.3) If response and task match, server will tell the robot to perform a task
            5.4) The robot and server maintain communication over this time to determine when the task is finished. While this is going on, the server will continuously update the client
            5.5) Once the task is completed, the server will tell the client is finished and end the current calibration step.
        6) Repeat step 5 for all calibration steps
        7) End calibration procedure and stop thread.
 */

import com.example.socketserver.CentralControllerClientSideInterface;
import com.example.socketserver.CentralControllerRobotSideInterface;
import com.example.socketserver.RobotData;
import com.example.socketserver.handlers.NetworkConstants;

import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class CalibrationManager implements Runnable {
    Thread t;
    ScheduledExecutorService timer;
    private CalibrationManagerState state;
    private CentralControllerRobotSideInterface robotInterface;
    private CentralControllerClientSideInterface clientInterface;

    CalibrationProcedure currentProcedure;

    public CalibrationManager(CentralControllerRobotSideInterface robotInterface, CentralControllerClientSideInterface clientInterface) {
        this.robotInterface = robotInterface;
        this.clientInterface = clientInterface;
        this.state = CalibrationManagerState.IDLE;

        // begin thread;
        t = new Thread(this, "calibration-thread");
        timer = Executors.newSingleThreadScheduledExecutor();
        timer.scheduleAtFixedRate(this, 0, 100, TimeUnit.MILLISECONDS);
        t.start();
    }

    public boolean canInitializeCalibration() {
        if (this.state == CalibrationManagerState.CALIBRATING) return false;
        RobotData robotData = robotInterface.getRobotData();
        Map robotInfo = robotData.getSubMap("/" + NetworkConstants.kRobotInfoTable);

        String robotState = (String) robotInfo.get("robotState");
        String testManagerState = (String) robotInfo.get("testManager/state");

        return robotState.equals("test") && testManagerState.equals("IDLE");
    }

    public void initializeCalibration() {
        if (this.canInitializeCalibration()) {
            this.state = CalibrationManagerState.CALIBRATING;
            // get procedure from robot

        }
    }


    @Override
    public void run() {

    }
}
