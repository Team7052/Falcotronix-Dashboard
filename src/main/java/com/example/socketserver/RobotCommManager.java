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
        //this.generateTestData();
        this.initializeNetworkTableConnection();
        String mapToString = this.toJSON(this.robotData);
        System.out.println(mapToString);
        t.start();
    }

    private void initializeNetworkTableConnection() {
        networkTableInstance = NetworkTableInstance.getDefault();

        // get network table entries
        NetworkTable motorDataTable = networkTableInstance.getTable("motorData");
        NetworkTable armKinematicsTable = networkTableInstance.getTable("armKinematics");

        networkTableInstance.startClientTeam(7052);
        networkTableInstance.startDSClient();

        motorDataTable.addEntryListener((table, key, entry, value, flags) -> {
            this.addEntryToRobotData((Map<String, Object>) robotData.get("motorData"), key, value);
        }, EntryListenerFlags.kNew | EntryListenerFlags.kUpdate);

        armKinematicsTable.addEntryListener((table, key, entry, value, flags) -> {
            this.addEntryToRobotData((Map<String, Object>) robotData.get("armKinematics"), key, value);
        }, EntryListenerFlags.kNew | EntryListenerFlags.kUpdate);

    }

    private void addEntryToRobotData(Map<String, Object> map, String key, NetworkTableValue value) {
        Object obj;

        if (value.getType() == NetworkTableType.kBoolean) obj = value.getBoolean() ? true : false;
        else if (value.getType() == NetworkTableType.kBooleanArray) obj = value.getBooleanArray();
        else if (value.getType() == NetworkTableType.kDouble) obj = value.getDouble();
        else if (value.getType() == NetworkTableType.kDoubleArray) obj = value.getDoubleArray();
        else if (value.getType() == NetworkTableType.kString) obj = value.getString();
        else if (value.getType() == NetworkTableType.kStringArray) obj = value.getStringArray();
        else obj = "";
        if (robotData.containsKey(key)) map.replace(key, obj);
        else map.put(key, obj);
    }

    @Override
    public void run() {
        // generate data to send
        String mapToString = this.toJSON(this.robotData);
        sessions.forEach(session -> {
            if (!session.isOpen()) {
                sessions.remove(session);
                return;
            }
            try {
                TextMessage message = new TextMessage(mapToString);
                session.sendMessage(message);
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
    }

    public HashMap<String, Object> initializeHashMap() {
        // json to string
        HashMap<String, Object> map = new HashMap<>();

        map.put("armKinematics", new HashMap<String, Object>());
        map.put("motorData", new HashMap<String, Object>());

        return map;
    }

    private void generateTestData() {
        double arr[] = {
                0.1, 0.5, 0.8, 1.0
        };
        ((Map<String, Object>) this.robotData.get("motorData")).put("leftMotorSpeed", 0.5);
        ((Map<String, Object>) this.robotData.get("motorData")).put("leftMotorIsSet", true);
        ((Map<String, Object>) this.robotData.get("motorData")).put("leftMotorProfile", arr);
    }

    public String toJSON(HashMap<String, Object> map) {
        Iterator it = map.entrySet().iterator();
        String jsonString = "{";
        while (it.hasNext()) {
            Map.Entry pair = (Map.Entry) it.next();
            String key = (String) pair.getKey();
            String keyPrefix = "\"" + key + "\":";
            String end = "";
            try {
                HashMap<String, Object> casted = (HashMap<String, Object>) pair.getValue();
                end = this.toJSON(casted);
            }
            catch (ClassCastException e) {
                Object value = pair.getValue();
                String str = this.getString(value);
                Double valDouble = this.getDouble(value);
                double[] valDoubleArray = this.getDoubleArray(value);
                if (str != null) end = "\"" + str + "\"";
                else if (isBoolean(value)) end = "" + (boolean) value;
                else if (valDouble != null) end = valDouble + "";
                else if (valDoubleArray != null) {
                    Double[] newArr = new Double[valDoubleArray.length];
                    for (int i = 0, n = newArr.length; i < n; i++) newArr[i] = valDoubleArray[i];
                    end += arrToString(newArr);
                }
            }
            if (it.hasNext()) {
                end += ",";
            }

            jsonString += keyPrefix + end;
        }
        jsonString += "}";
        return jsonString;
    }

    private <T> String arrToString(T[] arr) {
        String arrStr = "[";
        int length = arr.length;
        for (int i = 0; i < length; i++) {
            arrStr += arr[i] + "";
            if (i < length - 1) arrStr += ",";
        }
        arrStr += "]";
        return arrStr;
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

    private double[] getDoubleArray(Object value) {
        try {
            return (double[]) value;
        }
        catch (ClassCastException e) {
            return null;
        }
    }

    public void addSession(WebSocketSession session) {
        this.sessions.add(session);
    }
}
