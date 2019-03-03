package com.example.socketserver;

import com.example.socketserver.calibration.CalibrationManager;
import com.example.socketserver.handlers.RobotSideHandler;
import com.example.socketserver.util.JsonConverter;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class CentralController implements Runnable, CentralControllerRobotSideInterface, CentralControllerClientSideInterface {
    // singleton generation
    private static CentralController instance;
    public static CentralController getInstance() {
        if (instance == null) instance = new CentralController();
        return instance;
    }

    // thread and timer stuff
    private Thread t;
    private ScheduledExecutorService timer;

    // sessions list and network table
    private List<WebSocketSession> sessions = new ArrayList<>();
    RobotData robotData;

    // robot communication handler
    private RobotSideHandler robotSideHandler;
    private CalibrationManager calibrationManager;

    private CentralController() {
        // initialize robot data hash map
        this.robotData = new RobotData();
        // generate test data for hash map
        //this.generateTestData();

        // comment robotSideHandler if testing
        this.robotSideHandler = new RobotSideHandler(this);
        this.calibrationManager = new CalibrationManager(this, this);

        // begin thread and timer
        timer = Executors.newSingleThreadScheduledExecutor();
        t = new Thread(this, "robot-comm-thread");
        timer.scheduleAtFixedRate(this, 0, 100, TimeUnit.MILLISECONDS);
        t.start();
    }

    @Override
    public void run() {
        // generate data to send
        String mapToString = JsonConverter.encode(this.robotData.getMap());
        System.out.println(mapToString);
        this.sendMessage(mapToString);
    }

    public void handleIncomingMessage(String message) {
        System.out.println(message);
        String messages[] = message.split("/");
        if (messages.length == 1) return;
        if (messages[0].equals("Calibration")) {
            calibrationManager.initializeCalibration();
        }
    }


    private void generateTestData() {
        double arr[] = {
                0.1, 0.5, 0.8, 1.0
        };

        this.robotData.addRoute("/armKinematics");
        this.robotData.addRoute("/motorData");
        this.robotData.addRoute("/driverStation");
        this.robotData.addRoute("/robotInfo");

        this.robotData.getSubMap("/motorData").put("leftMotorSpeed", 0.5);
        this.robotData.getSubMap("/motorData").put("leftMotorIsSet", true);
        this.robotData.getSubMap("motorData").put("leftMotorProfile", arr);
        this.robotData.getSubMap("robotInfo").put("robotState", "test");
    }

    public void sendMessage(String message) {
        TextMessage textMessage = new TextMessage(message);
        this.sessions.forEach((session) -> {
            try {
                session.sendMessage(textMessage);
            }
            catch (IOException e) {
                e.printStackTrace();
            }
        });
    }

    public void addSession(WebSocketSession session) {
        this.sessions.add(session);
    }
    public boolean containsSession(WebSocketSession session) {
        if (this.sessions.contains(session)) {
            if (!session.isOpen()) {
                sessions.remove(session);
                return false;
            }
            return true;
        }
        return false;
    }

    public RobotData getRobotData() {
        return this.robotData;
    }

}