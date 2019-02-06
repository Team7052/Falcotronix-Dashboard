package hello;

import edu.wpi.first.networktables.NetworkTableInstance;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    static NetworkTableInstance instance = NetworkTableInstance.getDefault();

    public static void main(String[] args) {
        instance.startClientTeam(7052);
        instance.startServer();
        SpringApplication.run(Application.class, args);
    }
}
