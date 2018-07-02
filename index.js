const mqtt = require('mqtt-for-milkcocoa');

const makeURL = (url)=>this.url='wss://'+url+':443/websocket'
class MilkCocoa {
  constructor (url) {
    if(url){
      this.url=makeURL(url)
      this.appId=url.match(/(.+)\.mlkcca\.com/)[1]
      this.connectMqtt()
    }
  }
  connectMqtt () {
    const username = this.key ? 'k'+this.key+':'+this.secret : 'sdammy'
    this.client = mqtt.connect(this.url, {
      username: username,
      clientId: 'jsclientid01',
      password: this.appId,
      protocolVersion: 4,
      reconnectPeriod: 7000,
      clean : true,
      protocol: 'wss',
      wsOptions: {
        port: 443
      }
    });
  }
  static connectWithApiKey(url, key, secret){
    const result = new MilkCocoa()
    result.url=makeURL(url)
    result.key=key
    result.secret=secret
    result.appId=url.match(/(.+)\.mlkcca\.com/)[1]
    result.connectMqtt()
    return result
  }
  static connect(url){
    const result = new MilkCocoa()
    result.url=makeURL(url)
    result.appId=url.match(/(.+)\.mlkcca\.com/)[1]
    result.connectMqtt()
    return result
  }
  dataStore (name) {
    return new DataStore(this, name)
  }
}

class DataStore {
  constructor (milkcocoa, name) {
    this.client=milkcocoa.client
    this.appId=milkcocoa.appId
    this.name=name
  }
  publish (obj, command) {
    const payload = JSON.stringify({
      params: obj
    });

    this.client.publish(this.appId + '/' + this.name + '/' + command, payload, {
      qos : 0,
      retain : false
    });
  }
  push (obj) {
    this.publish(obj, 'push')
  }
  send (obj) {
    this.publish(obj, 'send')
  }
  on (command, callback) {
    const commandTopic=this.appId + '/' + this.name + '/' + command
    this.client.subscribe(commandTopic);
    this.client.on('message', function(topic, message) {
      if(topic===commandTopic){
        callback(JSON.parse(String(message)).params)
      }
    });
  }
}
module.exports = MilkCocoa
