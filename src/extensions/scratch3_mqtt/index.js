const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const formatMessage = require('format-message');

var mqtt = require('mqtt');

const protocolMenu = {
    ws: 'ws://',
    wss: 'wss://'
};

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
        /**
         * Register the runtime object in the class
         */
        this.runtime = runtime;

        /**
         * Initialise the client to null
         */
        this._client = null;

        /**
         * Disconnect upon stop
         */
        this.runtime.on('PROJECT_STOP_ALL', this.disconnectFromBroker);
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
                        default: 'connect [PROTOCOL] [URL] : [PORT]',
                        description: 'connect to broker'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PROTOCOL: {
                            type: ArgumentType.STRING,
                            menu: 'PROTOCOL',
                            defaultValue: protocolMenu.ws
                        },
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
                    opcode: 'send_pattern',
                    text: formatMessage({
                        id: 'mqtt.send_pattern',
                        default: 'publish on [CHANNEL] : [PATTERN]',
                        description: 'publishes the pattern to the channel'
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
                        PATTERN: {
                            type: ArgumentType.MATRIX8,
                            defaultValue: '0011110001000010101001011000000110100101100110010100001000111100'
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
                    PROTOCOL:[
                        {
                            text: 'ws://',
                            value: protocolMenu.ws
                        },
                        {
                            text: 'wss://',
                            value: protocolMenu.wss
                        }
                    ]
            }
        }
    }

    isConnected(){
      return this._client
        ? this._client.connected
        : false;
    }

    connectToBroker( args ) {

        if ( this.isConnected() ) {
            this.disconnectFromBroker();
        }

        // setup the connection
        console.log( "[mqtt] connecting to " + args.PROTOCOL + args.URL + ":" + args.PORT );

        this._client = mqtt.connect( args.PROTOCOL + args.URL + ":" + args.PORT );

        this._client.on('connect',function(){
            console.log( "[mqtt] Connected !" );
        });

        this._client.on('error', () => {
            console.log( "[mqtt] unable to connect !");
            this._client.end();
        });

        this._client.on('message', function(topic,message){
            console.log("[mqtt] received message on " + topic);
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
        console.log("[mqtt] disconnecting from MQTT broker... ");
        if ( this._client ) {  this._client.end(); }
    }

    subscribe( args ) {
        if ( !this.isConnected() ) {
            console.warn("[mqtt] cannot subscribe, not connected...");
            return;
        };

        this._client.subscribe( args.CHANNEL );
        console.log( "[mqtt] subscribed to " + args.CHANNEL );
    }

    unsubscribe( args ) {
        if ( !this.isConnected() ) {
            console.warn("[mqtt] cannot unsubscribe, not connected...");
            return;
        };

        this._client.unsubscribe( args.CHANNEL );
        console.log( "[mqtt] unsubscribed to " + args.CHANNEL );
    }

    publish( args ) {
          if ( !this.isConnected() ) {
              console.warn( "[mqtt] publish: unable to proceed, not connected" );
              return;
          }

          console.log( "[mqtt] publish channel: " + args.CHANNEL + ", message: " + args.MESSAGE );
          this._client.publish( args.CHANNEL, args.MESSAGE );
    }

    send_pattern( args ) {
        if ( !this.isConnected() ) {
            console.warn( "[mqtt] send_pattern: unable to proceed, not connected" );
            return;
        }

        console.log( "[mqtt] send_pattern to channel: " + args.CHANNEL + ", message: " + args.PATTERN );
        this._client.publish( args.CHANNEL, args.PATTERN );
    }
}

module.exports = Scratch3MQTTBlocks;
