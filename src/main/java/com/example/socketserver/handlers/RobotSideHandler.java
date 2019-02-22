package com.example.socketserver.handlers;

import com.example.socketserver.CentralControllerRobotSideInterface;
import edu.wpi.first.networktables.*;

import java.util.Map;

public class RobotSideHandler {
    public NetworkTableInstance networkTableInstance;
    //Network Tables

    private CentralControllerRobotSideInterface robotInterface;

    public RobotSideHandler(CentralControllerRobotSideInterface centralControllerInterface) {
        this.robotInterface = centralControllerInterface;

        networkTableInstance = NetworkTableInstance.getDefault();

        networkTableInstance = NetworkTableInstance.getDefault();

        // get network table entries
        this.addTableListener(NetworkConstants.kMotorDataTable, 0);
        this.addTableListener(NetworkConstants.kArmKinematicsTable, 0);
        this.addTableListener(NetworkConstants.kRobotInfoTable, 0);

        networkTableInstance.startClientTeam(7052);
        networkTableInstance.startDSClient();

    }

    private void addTableListener(String name, int level) {
        NetworkTable selectedTable = networkTableInstance.getTable(name);

        selectedTable.addSubTableListener((parent, subTableName, table) -> {

        }, false);

        selectedTable.addEntryListener((table, key, entry, value, flags) -> {
            this.addEntryToRobotData("/" + name, key, value);
        }, EntryListenerFlags.kNew | EntryListenerFlags.kUpdate | EntryListenerFlags.kDelete);
    }

    private void addEntryToRobotData(String route, String key, NetworkTableValue value) {
        Object obj;

        if (value.getType() == NetworkTableType.kBoolean) obj = value.getBoolean() ? true : false;
        else if (value.getType() == NetworkTableType.kBooleanArray) obj = value.getBooleanArray();
        else if (value.getType() == NetworkTableType.kDouble) obj = value.getDouble();
        else if (value.getType() == NetworkTableType.kDoubleArray) obj = value.getDoubleArray();
        else if (value.getType() == NetworkTableType.kString) obj = value.getString();
        else if (value.getType() == NetworkTableType.kStringArray) obj = value.getStringArray();
        else obj = "";
        Map map = this.robotInterface.getRobotData().getMap();
        if (map.containsKey(key)) map.replace(key, obj);
        else map.put(key, obj);
    }
}
