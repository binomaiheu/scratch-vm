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
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuNCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9Im1xdHQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHdpZHRoPSI0MDBweCIgaGVpZ2h0PSIyMDBweCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDQwMCAyMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0M4QzhDOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik0xMDUuMTM0LDEyNS40MTcKCQkJYzAsMTEuNjEyLTkuNTAxLDIxLjExMi0yMS4xMTIsMjEuMTEySDMxLjExMWMtMTEuNjExLDAtMjEuMTExLTkuNS0yMS4xMTEtMjEuMTEyVjcyLjUwNmMwLTExLjYxMSw5LjUtMjEuMTExLDIxLjExMS0yMS4xMTEKCQkJaDUyLjkxMWMxMS42MTEsMCwyMS4xMTIsOS41LDIxLjExMiwyMS4xMTFWMTI1LjQxN3oiLz4KCTwvZz4KCTxnPgoJCTxwYXRoIGZpbGw9IiNDOEM4QzgiIGQ9Ik01OS45MjgsMTQ1LjU5NWMwLDAuMzEyLTAuMDE5LDAuNjIzLTAuMDIyLDAuOTM1bC0zMi40OC0wLjAwOGMtOS41NTMsMC0xNy4zMTctNy43NDktMTcuMzQtMTcuMjk2CgkJCUwxMCw5NS42N0MzNy41NzUsOTUuNjcsNTkuOTI4LDExOC4wMjEsNTkuOTI4LDE0NS41OTV6Ii8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiNDOEM4QzgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTAsNzUuNzc1YzM4LjM1OSwwLDY5LjQ1MSwzMS4wOTcsNjkuNDUxLDY5LjQ1MwoJCQljMCwwLjQzOC0wLjAyMywwLjg2Ny0wLjAzMiwxLjMwMSIvPgoJPC9nPgoJPGc+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzhDOEM4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTI5LjIyNiw1MC44OTYKCQkJYzM5LjAxNiw3Ljk1MSw2OS40MDYsMzkuNjI2LDc1LjQ0OCw3OS4zIi8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiNDOEM4QzgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNODMuMDM1LDUxLjE1NgoJCQljOC4zMTIsNi43MTMsMTUuNjg3LDE0LjUyOCwyMS45MTEsMjMuMjE5Ii8+Cgk8L2c+Cgk8cGF0aCBmaWxsPSIjQzhDOEM4IiBkPSJNMjY0LjEyOSw1OC41MzRWNjkuNzZjMCwwLTAuNzk5LTExLjIyNi0yOC4wNjEtMTEuMjI2Yy0yNy4yNTcsMC0zNC40NzMsMjQuMDUyLTM0LjQ3MywyNC4wNTJWNjAuMTM5CgkJaC0yNS42NTRsLTEzLjYzMSw0Ni41MDJsLTEzLjYyOS00Ny4zMDRoLTI1LjY1NHY4MS45MDJsMTcuNjM4LTAuOTI5VjkwLjYwNWwxMi44MjgsNDkuNzA1aDE2LjgzNWwxNC40My01Mi4xMTJ2NTIuOTEzaDE2LjgzOAoJCXYtMjAuODQzYzAsMCwxNi4wMzUsMjIuNDQ2LDMyLjA2NiwyMi40NDZjMTYuMDM3LDAsMjEuNjQ5LTQuMDA4LDIxLjY0OS00LjAwOHM0LjAwNiwzLjIxLDcuMjEyLDUuNjEyCgkJYzMuMjEsMi40MDgsOC4wMTYsNC43ODQsOC4wMTYsNC43ODRsOC4zMjItMTIuNTQ5Yy00LjAwNS0xLjYwNS0xMS41MjgtOC4yNjgtMTEuNTI4LTguMjY4czkuNDI2LTExLjIxOSw5LjQyNi0yNS42NQoJCXMtNy4wMTgtMjYuNDU3LTcuMDE4LTI2LjQ1N2gxNi4wMzN2NjQuOTM5aDIwLjA0M1Y3NS4zNzNoNDAuODg5djY2LjU0MmgyMS42NDZWNzYuMTc0SDM5MHYtMTcuNjRIMjY0LjEyOXogTTI1My4yNzIsMTIxLjEyNgoJCWMtMS4yMDgsMS43MzEtMTIuNjUyLTExLjIxMi0xMi44OTQtMTAuOTczbC03Ljg0OSwxMC40NjVjLTAuNjMyLDAuMjc0LDEwLjczMSw4LjQyNiwxMC4wNzUsOC42MTcKCQljLTEuNDU5LDAuNDI4LTIuOTc3LDAuNjU2LTQuNTMzLDAuNjU2Yy0xMS4yOTEsMC0yMC40NDEtMTEuODQyLTIwLjQ0MS0yNi40NTljMC0xNC42MDksOS4xNS0yNi40NTUsMjAuNDQxLTI2LjQ1NQoJCWMxMS4yODksMCwyMC40NSwxMS44NDYsMjAuNDUsMjYuNDU1QzI1OC41MjIsMTEwLjIzNCwyNTYuNTMsMTE2LjQzOCwyNTMuMjcyLDEyMS4xMjZ6Ii8+CjwvZz4KPC9zdmc+Cg=='
/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuNCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9Im1xdHQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHdpZHRoPSI0MDBweCIgaGVpZ2h0PSIyMDBweCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDQwMCAyMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0M4QzhDOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik0xMDUuMTM0LDEyNS40MTcKCQkJYzAsMTEuNjEyLTkuNTAxLDIxLjExMi0yMS4xMTIsMjEuMTEySDMxLjExMWMtMTEuNjExLDAtMjEuMTExLTkuNS0yMS4xMTEtMjEuMTEyVjcyLjUwNmMwLTExLjYxMSw5LjUtMjEuMTExLDIxLjExMS0yMS4xMTEKCQkJaDUyLjkxMWMxMS42MTEsMCwyMS4xMTIsOS41LDIxLjExMiwyMS4xMTFWMTI1LjQxN3oiLz4KCTwvZz4KCTxnPgoJCTxwYXRoIGZpbGw9IiNDOEM4QzgiIGQ9Ik01OS45MjgsMTQ1LjU5NWMwLDAuMzEyLTAuMDE5LDAuNjIzLTAuMDIyLDAuOTM1bC0zMi40OC0wLjAwOGMtOS41NTMsMC0xNy4zMTctNy43NDktMTcuMzQtMTcuMjk2CgkJCUwxMCw5NS42N0MzNy41NzUsOTUuNjcsNTkuOTI4LDExOC4wMjEsNTkuOTI4LDE0NS41OTV6Ii8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiNDOEM4QzgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTAsNzUuNzc1YzM4LjM1OSwwLDY5LjQ1MSwzMS4wOTcsNjkuNDUxLDY5LjQ1MwoJCQljMCwwLjQzOC0wLjAyMywwLjg2Ny0wLjAzMiwxLjMwMSIvPgoJPC9nPgoJPGc+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzhDOEM4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTI5LjIyNiw1MC44OTYKCQkJYzM5LjAxNiw3Ljk1MSw2OS40MDYsMzkuNjI2LDc1LjQ0OCw3OS4zIi8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiNDOEM4QzgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNODMuMDM1LDUxLjE1NgoJCQljOC4zMTIsNi43MTMsMTUuNjg3LDE0LjUyOCwyMS45MTEsMjMuMjE5Ii8+Cgk8L2c+Cgk8cGF0aCBmaWxsPSIjQzhDOEM4IiBkPSJNMjY0LjEyOSw1OC41MzRWNjkuNzZjMCwwLTAuNzk5LTExLjIyNi0yOC4wNjEtMTEuMjI2Yy0yNy4yNTcsMC0zNC40NzMsMjQuMDUyLTM0LjQ3MywyNC4wNTJWNjAuMTM5CgkJaC0yNS42NTRsLTEzLjYzMSw0Ni41MDJsLTEzLjYyOS00Ny4zMDRoLTI1LjY1NHY4MS45MDJsMTcuNjM4LTAuOTI5VjkwLjYwNWwxMi44MjgsNDkuNzA1aDE2LjgzNWwxNC40My01Mi4xMTJ2NTIuOTEzaDE2LjgzOAoJCXYtMjAuODQzYzAsMCwxNi4wMzUsMjIuNDQ2LDMyLjA2NiwyMi40NDZjMTYuMDM3LDAsMjEuNjQ5LTQuMDA4LDIxLjY0OS00LjAwOHM0LjAwNiwzLjIxLDcuMjEyLDUuNjEyCgkJYzMuMjEsMi40MDgsOC4wMTYsNC43ODQsOC4wMTYsNC43ODRsOC4zMjItMTIuNTQ5Yy00LjAwNS0xLjYwNS0xMS41MjgtOC4yNjgtMTEuNTI4LTguMjY4czkuNDI2LTExLjIxOSw5LjQyNi0yNS42NQoJCXMtNy4wMTgtMjYuNDU3LTcuMDE4LTI2LjQ1N2gxNi4wMzN2NjQuOTM5aDIwLjA0M1Y3NS4zNzNoNDAuODg5djY2LjU0MmgyMS42NDZWNzYuMTc0SDM5MHYtMTcuNjRIMjY0LjEyOXogTTI1My4yNzIsMTIxLjEyNgoJCWMtMS4yMDgsMS43MzEtMTIuNjUyLTExLjIxMi0xMi44OTQtMTAuOTczbC03Ljg0OSwxMC40NjVjLTAuNjMyLDAuMjc0LDEwLjczMSw4LjQyNiwxMC4wNzUsOC42MTcKCQljLTEuNDU5LDAuNDI4LTIuOTc3LDAuNjU2LTQuNTMzLDAuNjU2Yy0xMS4yOTEsMC0yMC40NDEtMTEuODQyLTIwLjQ0MS0yNi40NTljMC0xNC42MDksOS4xNS0yNi40NTUsMjAuNDQxLTI2LjQ1NQoJCWMxMS4yODksMCwyMC40NSwxMS44NDYsMjAuNDUsMjYuNDU1QzI1OC41MjIsMTEwLjIzNCwyNTYuNTMsMTE2LjQzOCwyNTMuMjcyLDEyMS4xMjZ6Ii8+CjwvZz4KPC9zdmc+Cg=='
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
            name: 'MQTT Extension', 
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
