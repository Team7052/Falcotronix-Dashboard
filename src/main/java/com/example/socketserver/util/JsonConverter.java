package com.example.socketserver.util;

import java.util.Iterator;
import java.util.Map;

public class JsonConverter {
    public static String encode(Map<String, Object> map) {
        Iterator it = map.entrySet().iterator();
        String jsonString = "{";
        while (it.hasNext()) {
            Map.Entry pair = (Map.Entry) it.next();
            String key = (String) pair.getKey();
            String keyPrefix = "\"" + key + "\":";
            String end = "";
            try {
                Map<String, Object> casted = (Map<String, Object>) pair.getValue();
                end = JsonConverter.encode(casted);
            }
            catch (ClassCastException e) {
                Object value = pair.getValue();
                String str = JsonConverter.getString(value);
                Double valDouble = JsonConverter.getDouble(value);
                double[] valDoubleArray = JsonConverter.getDoubleArray(value);
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

    private static <T> String arrToString(T[] arr) {
        String arrStr = "[";
        int length = arr.length;
        for (int i = 0; i < length; i++) {
            arrStr += arr[i] + "";
            if (i < length - 1) arrStr += ",";
        }
        arrStr += "]";
        return arrStr;
    }

    private static String getString(Object obj) {
        try {
            return (String) obj;
        }
        catch (ClassCastException e) {
            return null;
        }
    }

    private static boolean isBoolean(Object bool) {
        try {
            boolean casted = (boolean) bool;
            return true;
        }
        catch (ClassCastException e) {
            return false;
        }
    }

    private static Double getDouble(Object value) {
        try {
            return (double) value;
        }
        catch(ClassCastException e) {
            return null;
        }
    }

    private static double[] getDoubleArray(Object value) {
        try {
            return (double[]) value;
        }
        catch (ClassCastException e) {
            return null;
        }
    }
}
