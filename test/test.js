var Airport = require('../js/main.js');
var Weather = require('../js/main.js');

var chai = require('chai');
var expect = chai.expect;

describe('setAirport', function() {
  xit('should create an airport', function() {

    var airport = new Airport({name: 'Centennial Airport', city: 'Centennial', link: 'www.guess.com', icao: 'KAPA', lat: '1111', long: '2222'});

    expect(pullAirportData('KAPA')).to.equal(16);
  })
});

describe('pullAirportData()', function() {
  xit('should pull data for KAGZ', function() {
    var airport = new Airport();
    expect(airport.name).to.equal();

})
});

describe('pullWeatherData()', function() {
  xit('should pull weather for KAPA', function() {
    var airport = new Airport();

    expect(pullWeatherData('KAPA')).to.equal('http://avwx.rest/api/metar.php\?station\=KAPA\&format\=JSON');

  })
});
