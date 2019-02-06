package hello;

public class MotorData {
    private double percentOutput;
    private double current;
    private double encoderPosition;
    private double encoderHomePosition;

    public MotorData(double percentOutput, double current, double encoderPosition, double encoderHomePosition) {
        this.percentOutput = percentOutput;
        this.current = current;
        this.encoderPosition = encoderPosition;
        this.encoderHomePosition = encoderHomePosition;
    }

    public double getPercentOutput() {
        return percentOutput;
    }

    public double getCurrent() {
        return current;
    }

    public double getEncoderPosition() {
        return encoderPosition;
    }

    public double getEncoderHomePosition() {
        return encoderHomePosition;
    }
}
