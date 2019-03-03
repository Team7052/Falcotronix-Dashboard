package com.example.socketserver;


import java.util.*;

public class RobotData {

    private Map<String, Object> map;

    public RobotData() {
        map = new HashMap<>();
    }

    public Map<String, Object> getMap() {
        return this.map;
    }

    public Object getValue(String key, String route) {
        Map<String, Object> subMap = this.getSubMap(route);
        if (subMap != null) {
            return subMap.get(key);
        }
        return null;
    }

    public void addRoute(String path) {
        if (path.equals("/") || path.length() == 0) return;

        ArrayList<String> paths = new ArrayList<>(Arrays.asList(path.split("/")));
        if (path.charAt(0) == '/') {
            paths.remove(0);
        }
        Map<String, Object> currentMap = this.map;
        for (String string: paths) {
            currentMap.putIfAbsent(string, new HashMap<String, Object>());
            currentMap = (Map<String, Object>) currentMap.get(string);
        }
    }

    public Map<String, Object> getSubMap(String path) {
        if (path.equals("/")) return this.map;
        if (path.length() == 0) return this.map;

        ArrayList<String> paths = new ArrayList<>(Arrays.asList(path.split("/")));
        if (path.charAt(0) == '/') {
            paths.remove(0);
        }

        return this.getSubTable(this.map, paths);
    }

    private Map<String, Object> getSubTable(Map<String, Object> submap, List<String> paths) {
        if (paths.size() == 1) {
            return (Map<String, Object>) submap.get(paths.get(0));
        }

        Object value = submap.get(paths.get(0));
        if (value == null) return null;

        try {
            Map temp = ((Map<String, Object>) value);
            return temp;
        }
        catch(ClassCastException e) {
            return null;
        }

    }
}
