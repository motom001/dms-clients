'use strict';

const Homey = require('homey');

/**
 * DMS für Homey Pro: neue Post, Zu erledigen und Fristen aus dem selbst gehosteten DMS.
 * Die App spricht nur mit dem DMS, dessen Adresse du beim Gerät einträgst – keine Telemetrie, keine Dritten.
 */
module.exports = class DmsApp extends Homey.App {
  async onInit() {
    this.log('DMS-App gestartet');
  }
};
