package com.example.socketserver;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.wpi.first.networktables.*;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.*;
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

    private HashMap<String, Object> robotData;

    private RobotCommManager() {
        System.out.println("Initialize");
        timer = Executors.newSingleThreadScheduledExecutor();
        t = new Thread("robot-comm-thread");
        timer.scheduleAtFixedRate(this, 0, 100, TimeUnit.MILLISECONDS);

        this.robotData = this.initializeHashMap();
        this.initializeNetworkTableConnection();

        t.start();
    }

    private void initializeNetworkTableConnection() {
        networkTableInstance = NetworkTableInstance.getDefault();

        // get network table entries
        NetworkTable motorDataTable = networkTableInstance.getTable("motorData");

        networkTableInstance.startClientTeam(7052);
        networkTableInstance.startDSClient();

        motorDataTable.addEntryListener((table, key, entry, value, flags) -> {
            String converted = this.convertEntryData(value);
            Map map = (HashMap<String, Object>) robotData.get("motorData");
            if (robotData.containsKey(key)) map.replace(key, converted);
            else map.put(key, converted);
        }, EntryListenerFlags.kNew | EntryListenerFlags.kUpdate);


    }

    private String convertEntryData(NetworkTableValue value) {
        if (value.getType() == NetworkTableType.kBoolean) return value.getBoolean() ? "true" : "false";
        else if (value.getType() == NetworkTableType.kBooleanArray) return value.getBooleanArray().toString();
        else if (value.getType() == NetworkTableType.kDouble) return value.getDouble() + "";
        else if (value.getType() == NetworkTableType.kDoubleArray) return value.getDoubleArray().toString();
        else if (value.getType() == NetworkTableType.kString) return value.getString();
        else if (value.getType() == NetworkTableType.kStringArray) return value.getStringArray().toString();

        return value.getRaw().toString();
    }

    @Override
    public void run() {
        // generate data to send
        sessions.forEach(session -> {
            if (!session.isOpen()) {
                sessions.remove(session);
                return;
            }
            try {
                String mapToString = this.robotData.toString();
                TextMessage message = new TextMessage(mapToString.replace("=", ":"));
                session.sendMessage(message);

            } catch (IOException e) {
                e.printStackTrace();
            }
        });
    }

    public HashMap<String, Object> initializeHashMap() {
        // json to string
        HashMap<String, Object> map = new HashMap<>();

        map.put("kinematics", new HashMap<String, Object>());
        map.put("motorData", new HashMap<String, Object>());

        return map;
    }

    public String toJSON(HashMap<String, Object> map) {
        Iterator it = map.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry pair = (Map.Entry) it.next();
            String key = (String) pair.getKey();
            String keyPrefix = "\"" + key + "\":";
            String end = "";
            try {
                HashMap<String, Object> casted = (HashMap<String, Object>) pair.getValue();
                end = "{" + this.toJSON(casted) + "}";
            }
            catch (ClassCastException e) {
                Object value = pair.getValue();
                String str = this.getString(value);
                if (str != null) {
                    end = keyPrefix + "\"" + str + "\"";
                }

                if (isBoolean(value)) {
                    end = keyPrefix + (boolean) value;
                }
            }
        }
    }

    private String getString(Object obj) {
        try {
            return (String) obj;
        }
        catch (ClassCastException e) {
            return null;
        }
    }

    private boolean isBoolean(Object bool) {
        try {
            boolean casted = (boolean) bool;
            return true;
        }
        catch (ClassCastException e) {
            return false;
        }
    }

    private Double getDouble(Object value) {
        try {
            return (double) value;
        }
        catch(ClassCastException e) {
            return null;
        }
    }

    private Integer isInteger(Object value) {
        try {
            return (int) value;
        }
        catch(ClassCastException e) {
            return null;
        }
    }

    public void addSession(WebSocketSession session) {
        this.sessions.add(session);
    }
}
