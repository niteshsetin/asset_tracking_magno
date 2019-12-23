/*
 * This script is written for the ESP32 chip series.
 * The core funciton of the script is to let the chip set behave as a client node, in a server-clint model.
 * 
 * The client is equipped with a HMC5883 Magnetometer digital compass. The node sends the information from itself to
 * the server.
 * The server then computes the vector based on the distance and the compass reading. The bearing and the heading is used to calculate the
 * the heading in degrees.
 * 
 */
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClient.h>
#include <WiFiMulti.h>
#include <ArduinoJson.h>


#define REFRESH_INTERVAL 5000
#define BAUD_RATE        115200
#define SENSOR_ID        102
#define LED              16

int connectionCounter = 0;
const char* ssid     = "API2";
const char* password = "lawl123456";
const char* host     = "10.0.0.1";
int         port     = 4242;

int         error    = 0;
long long   timer    = 0;
WiFiMulti   wifiMulti;        // Multi connection WiFi node instance.

struct Connection {
  char* ssid; 
  char* password;

  void setAttrs(char* ssid_, char* password_){
    this->ssid = ssid_;
    this->password = password_;
    return;
  } 
};


struct Connection prevConnections[2];
struct Connection currentConnections[2];



void setup() {
    Serial.begin(BAUD_RATE);
    struct Connection conn_1, conn_2;
    conn_1.setAttrs("API1", "lawl123456");
    conn_2.setAttrs("API2", "lawl123456");
    currentConnections[0] = conn_1;
    currentConnections[1] = conn_2;
    delay(500);
}


int getStrength(int points){
  // A function for returning the signal strength with an averaged value.
  
    long rssi = 0;
    long averageRSSI=0;
    for (int i=0;i < points;i++){
        rssi += WiFi.RSSI();
        delay(5);
    }
    averageRSSI=rssi/points;
    return averageRSSI;
}






void scanNetwork() {
  // A function for scanning the network for the best suitable network to connect too.
  WiFi.disconnect();
//  wifiMulti.addAP("API1", "lawl123456");
//  wifiMulti.addAP("API2", "lawl123456");
//  while(wifiMulti.run() != WL_CONNECTED) {
//    digitalWrite(LED, 0);
//    delay(100);
//    digitalWrite(LED, 1);
//    delay(100);
//    Serial.print(".");
//  }
//  Serial.println();
//  Serial.println("Connected to: " + WiFi.SSID());

  if (connectionCounter > 1) {
    connectionCounter = 0;
  }
  Serial.println("Connecting to:" + String(currentConnections[connectionCounter].ssid));
  WiFi.begin(currentConnections[connectionCounter].ssid, currentConnections[connectionCounter].password);

  while(WiFi.status() != WL_CONNECTED){
    delay(150);
  }
  
  Serial.println();
  Serial.println("Connected to: " + WiFi.SSID());
  connectionCounter++;
  Serial.println(String(connectionCounter));
  Serial.println();
}

void loop() {
  int disconnectCounter = 0;
  while(1) {
      if ((long long)millis() - (long long)timer >= 5000) {
       timer = millis();
       if((WiFi.status() != WL_CONNECTED)) {
        scanNetwork();
       }
       
       if((WiFi.status() == WL_CONNECTED)) {
        WiFiClient txClient;
        if(!txClient.connect(host, port)){
            Serial.println("Connection error");
        }
        else {
          StaticJsonDocument<128> doc;
          doc["packet_type"] = "information";
          doc["distance"]    = getStrength(20);
          doc["orientation"] = "44";
          doc["sensor_id"]   = SENSOR_ID;
          String payload;
          serializeJson(doc, payload);
          Serial.println("Distance: " + String(getStrength(20)) + " orientation: " + String("44"));
          txClient.println(payload);
          WiFi.disconnect();
      }
    }
    else {
      disconnectCounter++;
      if (disconnectCounter >= 5) {
        Serial.println("Restarting chip");
        ESP.restart();
      }
      Serial.println("Restarting in: " + String(5 - disconnectCounter));
    }
   }
  }
}
