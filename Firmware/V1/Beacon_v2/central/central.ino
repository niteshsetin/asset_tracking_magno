#include <WiFiMulti.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>

#include <WiFiClient.h>

const char* ssid     = "API2";
const char* password = "lawl123456";
WiFiServer  server(2424);
WiFiMulti   WiFiMulti;

IPAddress local_ip(192,168,4,5);
IPAddress gateway(192,168,4,5);
IPAddress subnet(255, 255, 255, 0);
long long timer;

void setWifi(const char* name, const char* password);


void setup(){
  Serial.begin(115200);
  setWifi(ssid, password);
}

void setWifi( const char* name, const char* password){

  while(!WiFi.softAP(name, password)) {
    Serial.println(".");
    delay(150);
  }
  
  Serial.println("WIFI < " + String(ssid) + " > ... Started");
  
  Serial.println(WiFi.softAPIP());
  server.begin();
  Serial.println("Server Started");
  return;
}


void loop() {
  WiFiClient rxClient;
  rxClient = server.available();
  if (rxClient) {
    if(rxClient.connected()){
      Serial.println("Client Connected");
      Serial.println(rxClient.remoteIP());
      String buffer = rxClient.readStringUntil('\n');
      StaticJsonDocument<512> doc;
      DeserializationError error = deserializeJson(doc, buffer);
      if(error) {
        Serial.println(error.c_str());
        return;
      }
      if (doc["message"] == 0x00) {
           rxClient.println("{\"central\":\"room-1\"}");
           Serial.println("ID requested");   
      }
      
        String message = doc["message"];
        double rssi    = doc["rssi"];
        Serial.println("Message: " + String(message));
        Serial.println("rssi:    " + String(rssi));
        
      rxClient.stop();
    }
  }

  if ((long long) millis() - (long long) timer >= 3000) {
    Serial.print("Stations: ");
    Serial.println(WiFi.softAPgetStationNum());
    timer= millis();
  }
}
