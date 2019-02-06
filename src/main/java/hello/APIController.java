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
        NetworkTable table = Application.instance.getTable("motorData");
        Set<String> keys = table.getKeys();
        System.out.println(keys);
        ArrayList<String> motorNames = new ArrayList<>(keys);
        return motorNames;
    }
}
