
import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { RaspberryPiHomebridgePlatform } from './platform';
var PythonShell = require('python-shell');
var executePython = require("child_process").exec;

export class ServoStatelessProgrammableSwitchAccessory {
 // public readonly Service: typeof Service = this.api.hap.Service;
  //public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  private service: Service;
  private outputState = false;
  private pythonScriptCmd;
  private log;
  private config;

  constructor(
	private readonly platform: RaspberryPiHomebridgePlatform,
	private readonly accessory: PlatformAccessory,
  )
  {
      this.log = this.platform.log;
      this.config = this.platform.config;
      // extract name from config
      // this.name = config.name;
	  this.pythonScriptCmd = this.config.scriptCmd;

	  // set accessory information
	  this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

	  // you can create multiple services for each accessory
	  this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

	  // set the service name, this is what is displayed as the default name on the Home app
	  // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
	  this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.DisplayName);

        this.service.getCharacteristic(this.platform.Characteristic.On)
        .on('get', this.handleProgrammableSwitchOutputStateGet.bind(this))
        .on('set', this.handleProgrammableSwitchOutputStateSet.bind(this));

  }

  /**
   * Handle requests to get the current value of the "Programmable Switch Output State" characteristic
   */
  handleProgrammableSwitchOutputStateGet(callback) {
    this.log.debug('Triggered GET ProgrammableSwitchOutputState value:', this.outputState);

    // set this to a valid value for ProgrammableSwitchOutputState
    var error = null;
    callback(error, this.outputState);
  }

  /**
   * Handle requests to set the "Programmable Switch Output State" characteristic
   */
  handleProgrammableSwitchOutputStateSet(value, callback) {
    this.log.debug('Triggered SET ProgrammableSwitchOutputState:', value);
    var success = false;
    var scriptError = null;
    var logger = this.log;
    this.outputState = value;
    if(value == true)
    {
      this.log.debug('Value :', value);
      
      executePython(this.pythonScriptCmd, function (error, stdout, stderr) {
        // Error detection
        if (error && stderr) {
          success = false;
          logger.debug('Error in running python script:', stderr);
          scriptError = stderr;
        }
    
        success = true;
      });
    
      var localService = this.service;
      var characteristic = this.platform.Characteristic;
      var control = this;
      setTimeout(function () {
        localService.updateCharacteristic(characteristic.On, false);
        control.setState(false);
      }.bind(this), 1000);
    }

    if (success) {
      callback(null,this.outputState);
    }
    else {
      callback(scriptError, this.outputState);
    }
  }

  setState (value: boolean){
    this.outputState = value;
  }

}