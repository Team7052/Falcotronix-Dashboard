package com.example.socketserver;

import edu.wpi.first.networktables.NetworkTable;
import edu.wpi.first.networktables.NetworkTableEntry;
import edu.wpi.first.networktables.NetworkTableInstance;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class RobotCommManager implements Runnable {
    private static RobotCommManager instance;
    Thread t;
    ScheduledExecutorService timer;
    NetworkTableInstance networkTableInstance;

    private List<WebSocketSession> sessions = new ArrayList<>();

    public static RobotCommManager getInstance() {
        if (instance == null) instance = new RobotCommManager();
        return instance;
    }
    NetworkTableEntry entry;


    private RobotCommManager() {
        System.out.println("Initialize");
        timer = Executors.newSingleThreadScheduledExecutor();
        t = new Thread("robot-comm-thread");
        timer.scheduleAtFixedRate(this, 0, 100, TimeUnit.MILLISECONDS);
        System.out.println("INSTANCE");
        networkTableInstance = NetworkTableInstance.getDefault();

        NetworkTable table = networkTableInstance.getTable("imuSensorData");
        entry = table.getEntry("pitch");

        networkTableInstance.startClientTeam(7052);

        t.start();
    }
    @Override
    public void run() {
        System.out.println("run");

        double toSend = entry.getValue().getDouble();
        sessions.forEach(session -> {
            if (!session.isOpen()) {
                sessions.remove(session);
                return;
            }
            try {

                session.sendMessage(new TextMessage("value: " + toSend));
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
    }


    public void addSession(WebSocketSession session) {
        this.sessions.add(session);
    }
}
