
import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { RaspberryPiHomebridgePlatform } from './platform';
var PythonShell = require('python-shell');
var executePython = require("child_process").exec;

export class ServoStatelessProgrammableSwitchAccessory {
 // public readonly Service: typeof Service = this.api.hap.Service;
  //public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  private service: Service;
  private outputState;
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
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'YanShon')
      .setCharacteristic(this.platform.Characteristic.Model, 'Servo')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-SerialNumber');

	  // you can create multiple services for each accessory
	  this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

	  // set the service name, this is what is displayed as the default name on the Home app
	  // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
	  this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.DisplayName);

      // create a new Stateless Programmable Switch service
      // this.service = new this.Service.StatefulProgrammableSwitch(this.name);

      // create handlers for required characteristics
      this.service.getCharacteristic(this.platform.Characteristic.ProgrammableSwitchEvent)
        .onGet(this.handleProgrammableSwitchEventGet.bind(this));

      this.service.getCharacteristic(this.platform.Characteristic.ProgrammableSwitchOutputState)
        .on('get', this.handleProgrammableSwitchOutputStateGet.bind(this))
        .on('set', this.handleProgrammableSwitchOutputStateSet.bind(this));

  }

  /**
   * Handle requests to get the current value of the "Programmable Switch Event" characteristic
   */
  handleProgrammableSwitchEventGet() {
    this.log.debug('Triggered GET ProgrammableSwitchEvent');

    // set this to a valid value for ProgrammableSwitchEvent
	this.outputState = this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;

    return this.outputState;
  }

  /**
   * Handle requests to get the current value of the "Programmable Switch Output State" characteristic
   */
  handleProgrammableSwitchOutputStateGet(callback) {
    this.log.debug('Triggered GET ProgrammableSwitchOutputState');

    // set this to a valid value for ProgrammableSwitchOutputState
	this.outputState = this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS;
	var error = null;
	callback(error, this.outputState);
  }

  /**
   * Handle requests to set the "Programmable Switch Output State" characteristic
   */
  handleProgrammableSwitchOutputStateSet(value, callback) {
    this.log.debug('Triggered SET ProgrammableSwitchOutputState:', value);
	// var options = {};
	// options.scriptPath = this.pythonScriptPath;
			
	// PythonShell.run(this.pythonScriptName, options, function (err, results) {
	// 	if (err) {
	// 		this.log.debug("Script Error", options.scriptPath, options.args, err);
	// 		callback(err);
	// 	} else {
	// 		// results is an array consisting of messages collected during execution
	// 		this.log.debug('%j', results);
	// 	}
	// }.bind(this));

	// Execute command to detect state
	this.log.debug('Set State Value:', value);
	var success = false;
	var scriptError = null;
	var logger = this.log;
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
  setTimeout(function () {
    localService.setCharacteristic(characteristic.On, false);
  }.bind(this), 1000);

	if (success) {
		callback(null);
	}
	else {
		callback(scriptError);
	}
  }

}