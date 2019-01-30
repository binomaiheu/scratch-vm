const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const formatMessage = require('format-message');

var mqtt = require('mqtt');

/**
 * Icon svg to be displayed in the blocks category menu, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const menuIconURI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcmFkaW8iPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjIiPjwvY2lyY2xlPjxwYXRoIGQ9Ik0xNi4yNCA3Ljc2YTYgNiAwIDAgMSAwIDguNDltLTguNDgtLjAxYTYgNiAwIDAgMSAwLTguNDltMTEuMzEtMi44MmExMCAxMCAwIDAgMSAwIDE0LjE0bS0xNC4xNCAwYTEwIDEwIDAgMCAxIDAtMTQuMTQiPjwvcGF0aD48L3N2Zz4='
/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcmFkaW8iPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjIiPjwvY2lyY2xlPjxwYXRoIGQ9Ik0xNi4yNCA3Ljc2YTYgNiAwIDAgMSAwIDguNDltLTguNDgtLjAxYTYgNiAwIDAgMSAwLTguNDltMTEuMzEtMi44MmExMCAxMCAwIDAgMSAwIDE0LjE0bS0xNC4xNCAwYTEwIDEwIDAgMCAxIDAtMTQuMTQiPjwvcGF0aD48L3N2Zz4='

var recv = {};
var recv_msg = {};

/**
 * Class for the mqtt extension for Scratch 3
 * @constructor
 */
class Scratch3MQTTBlocks {
    constructor (runtime) {
        this.runtime = runtime;
    

        this.runtime.on('PROJECT_STOP_ALL', this.disconnectFromBroker);
	    
        this._client = null;
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     * template: see : https://github.com/LLK/scratch-vm/wiki/Scratch-3.0-Extensions-Specification
     */
    getInfo () {
        return {
            id: 'mqtt',
            name: 'MQTT', 
            blockIconURI: blockIconURI,
            menuIconURI: menuIconURI,
            blocks: [
                {
                    opcode: 'connectToBroker',
                    text: formatMessage({
                        id: 'mqtt.connectToBroker',
                        default: 'connect to [URL] port [PORT]',
                        description: 'connect to broker'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'mqtt.defaultServer',
                                default: '127.0.0.1',
                                description: 'default URL to connect to'
                            })
                        },
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'mqtt.defaultPort',
                                default: '8083',
                                description: 'default port to connect to'
                            })
                        }
                    }
                },
                {
                    opcode: 'connectToSecureBroker',
                    text: formatMessage({
                        id: 'mqtt.connectToSecureBroker',
                        default: 'connect to secure [URL] port [PORT]',
                        description: 'connect to secure broker over ssl'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'mqtt.defaultServer',
                                default: '127.0.0.1',
                                description: 'default URL to connect to'
                            })
                        },
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'mqtt.defaultPort',
                                default: '8083',
                                description: 'default port to connect to'
                            })
                        }
                    }
                },
                {
                    opcode: 'disconnectFromBroker',
                    text: formatMessage({
                        id: 'mqtt.disconnectFromBroker',
                        default: 'disconnect',
                        description: 'disconnect from broker'
                    }),
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'publish',
                    text: formatMessage({
                        id: 'mqtt.publish',
                        default: 'publish on [CHANNEL] : [MESSAGE]',
                        description: 'publishes the message to the channel'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CHANNEL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'mqtt.defaultChannel',
                                default: 'scratch3-mqtt',
                                description: 'default channel to publish'
                            })
                        },
                        MESSAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'mqtt.defaultMessage',
                                default: 'hello world',
                                description: 'default message to publish'
                            })
                        }
                    }
                },
                {
                    opcode: 'subscribe',
                    text: formatMessage({
                        id: 'mqtt.subscribe',
                        default: 'subscribe to [CHANNEL]',
                        description: 'subscribes to the channel'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CHANNEL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'mqtt.defaultSubscribeChannel',
                                default: 'scratch3-mqtt',
                                description: 'default channel to subscribe'
                            })
                        }
                    }
                },
                {
                    opcode: 'unsubscribe',
                    text: formatMessage({
                        id: 'mqtt.unsubscribe',
                        default: 'unsubscribe from [CHANNEL]',
                        description: 'unsubscribes from the channel'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CHANNEL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'mqtt.defaultUnsubscribeChannel',
                                default: 'scratch3-mqtt',
                                description: 'default channel to unsubscribe'
                            })
                        }
                    }
                },		 		        
                {
		            opcode: 'isConnected',
                    text: formatMessage({
                        id: 'mqtt.isConnected',
                        default: 'is connected',
                        description: 'checks whether we are connected'
                    }),
                    blockType: BlockType.BOOLEAN
                },
                {
		            opcode: 'received',
                    text: formatMessage({
                        id: 'mqtt.received',
                        default: 'received on [CHANNEL]',
                        description: 'starts when we received a messge on the channel'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        CHANNEL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'mqtt.defaultReceivedChannel',
                                default: 'scratch3-mqtt',
                                description: 'default channel to receive'
                            })
                        }
                    }
                },
                {
                    opcode: 'message',
                    text: formatMessage({
                        id: 'mqtt.message',
                        default: 'last message on [CHANNEL]',
                        description: 'gets the last message on the channel'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        CHANNEL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'mqtt.defaultReceivedChannelMessage',
                                default: 'scratch3-mqtt',
                                description: 'default channel to receive'
                            })
                        }
                    }
                }

            ],
            menus: {
            }
        }
    }

    isConnected(){
        if ( ! this._client ) return false;
        return this._client.connected;
    }

    connectToBroker( args ) {
        
        if ( this._client ) {
          if ( this._client.connected == true ) {
                this._client.end();
            } 
        }

        // setup the connection
        console.log( "Connecting to MQTT broker " + args.URL + ":" + args.PORT );
        this._client = mqtt.connect( "ws://" + args.URL + ":" + args.PORT );
 
        this._client.on('connect',function(){
            console.log( "connected !" );
        });
        
        this._client.on('message', function(topic,message){
            console.log("received message on " + topic);
            console.log(message.toString());

            recv[topic] = true;
            recv_msg[topic] = message.toString();
        });

    }

    connectToSecureBroker( args ) {
        
        if ( this._client ) {
          if ( this._client.connected == true ) {
                this._client.end();
            } 
        }

        // setup the connection
        console.log( "Connecting to Secure MQTT broker " + args.URL + ":" + args.PORT );
        this._client = mqtt.connect( "wss://" + args.URL + ":" + args.PORT );
 
        this._client.on('connect',function(){
            console.log( "connected !" );
        });
        
        this._client.on('message', function(topic,message){
            console.log("received message on " + topic);
            console.log(message.toString());

            recv[topic] = true;
            recv_msg[topic] = message.toString();
        });

    }

    received( args ) {
        if ( recv[args.CHANNEL] == true ) {
            recv[args.CHANNEL] = false;
            return true
        }
        return false;
    }

    message(args) {
        return recv_msg[args.CHANNEL];
    }

    disconnectFromBroker(args) {
        console.log("Disconnecting from MQTT broker... ");
        if ( this._client != null ) {  this._client.end(); }
    }

    subscribe( args ) {
        if ( this._client != null ) {
            if ( this._client.connected == true ) {
                this._client.subscribe( args.CHANNEL );
                console.log( "subscribed to " + args.CHANNEL );
            }  else {
                console.warn("cannot subscribe, not connected...");
            } 
        }
    }

    unsubscribe( args ) {
        if ( this._client != null ) {
            if ( this._client.connected == true ) {
                this._client.unsubscribe( args.CHANNEL );
                console.log( "unsubscribed to " + args.CHANNEL );
            }  else {
                console.warn("cannot unsubscribe, not connected...");
            } 
        }
    }

    publish( args ) {
        if ( this._client.connected == true ) {
            console.log( "publish channel: " + args.CHANNEL + ", message: " + args.MESSAGE );
            this._client.publish( args.CHANNEL, args.MESSAGE );
        } else {
            console.warn( "publish: unable to proceed, not connected" );
        }
    }

}

module.exports = Scratch3MQTTBlocks;
