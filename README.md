
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


# Homebridge RaspberryPi PetFeeder

This Plugin will help to add a servo motor to raspberry PI to use as a pet feeder. This has a single switch which need the script python command. This switch will automatically turned off after 2 seconds.


<span align="center">

### Steps

</span>

## Create Python file
Create a python file to run the servo motor.
1. nano feed.py
```
import RPi.GPIO as GPIO
from time import sleep

backward = 10
forward  = 20    #Adjust these values yourself


GPIO.setmode(GPIO.BOARD)
GPIO.setup(11, GPIO.OUT)
servo1 = GPIO.PWM(11, 100)

servo1.start(backward)
sleep(1)
servo1.ChangeDutyCycle(forward)
sleep(1.5)

servo1.stop()
GPIO.cleanup()
exit()
```
2. CRTL+x, Shift+Y

## Edit Config Settings
Add python3 [path to python file]
