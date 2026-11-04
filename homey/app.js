'use strict';

const Homey = require('homey');

/**
 * Ablago für Homey Pro: neue Post, Zu erledigen und Überfälliges aus der selbst gehosteten Dokumentenablage.
 * Die App spricht nur mit der Adresse von Ablago, die du beim Gerät einträgst – keine Telemetrie, keine Dritten.
 */
module.exports = class DmsApp extends Homey.App {
  async onInit() {
    this.log('Ablago-App gestartet');
  }
};
