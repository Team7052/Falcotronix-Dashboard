package hello;

import java.util.ArrayList;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;

import edu.wpi.first.networktables.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class APIController {

    @RequestMapping("/motors")
    public ArrayList<String> motor() {
        NetworkTableInstance instance = NetworkTableInstance.getDefault();
        NetworkTable table = instance.getTable("motorData");
        Set<String> keys = table.getKeys();
        ArrayList<String> motorNames = new ArrayList<>();
        for (String key: keys) {
            NetworkTableEntry entry = table.getEntry(key);
            NetworkTableValue value = entry.getValue();
            if (value.getType() == NetworkTableType.kString) {
                motorNames.add(value.getString());
            }
        }
        ArrayList<String> fakeNames = new ArrayList<>();

        fakeNames.add("frontLeftMotor");
        fakeNames.add("frontRightMotor");
        return fakeNames;
        //return motorNames;
    }
}
