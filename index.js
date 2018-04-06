'use strict'

const CUSTOMER_ID = 'SET_YOUR_CUSTOMER_ID_HERE'

const path = require('path')

const awsIotDeviceSdk = require('aws-iot-device-sdk')

const subscribeTopic = `${CUSTOMER_ID}/+/inventory`

let mqttClient = awsIotDeviceSdk.device({
  keyPath: path.join(__dirname, 'certs', 'private.key'),
  certPath: path.join(__dirname, 'certs', 'certificate.pem'),
  caPath: path.join(__dirname, 'certs', 'root.ca.pem'),
  clientId: `customer-${CUSTOMER_ID}-consumer-` + Date.now(),
  host: 'a11uydwkfjit3.iot.ap-southeast-2.amazonaws.com'
})

mqttClient
  .on('connect', (data) => {
    console.log('Successfully connected to IoT bus', data)

    // Subscribe to topic once a connection has been established
    mqttClient.subscribe(subscribeTopic)
  })
  .on('message', (topic, payload) => {
    console.log('Received IoT Message via Subscription', topic)

    try {
      const strPayload = payload.toString()
      const jsonPayload = JSON.parse(strPayload)

      // Do what ever your need with the JSON.
      // This example will just log it to stdout
      // in a pretty JSON format.
      console.log(JSON.stringify(jsonPayload, null, 2))
    } catch (err) {
      console.error('Processing message payload error', err)
    }
  })
  .on('offline', (data) => console.log('MQTT client is offline'))
  .on('close', (data) => console.log('Closing MQTT client'))
  .on('error', (err) => {
    console.error('MQTT error', err)
    disconnect()
  })

function disconnect () {
  if (mqttClient) {
    mqttClient.unsubscribe(subscribeTopic)
    mqttClient.removeAllListeners('connect')
    mqttClient.removeAllListeners('message')
    mqttClient.removeAllListeners('offline')
    mqttClient.removeAllListeners('close')
    mqttClient.removeAllListeners('error')
    mqttClient.end()
    mqttClient = null
  }
}
