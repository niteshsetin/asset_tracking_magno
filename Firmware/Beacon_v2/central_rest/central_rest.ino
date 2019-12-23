#include <WiFiClient.h>
#include <ESPmDNS.h>
#include <WebServer.h>
#include <ArduinoJson.h>

const char* ssid     = "API2";
const char* password = "lawl123456";

IPAddress local_ip(192,168,4,5);
IPAddress gateway(192,168,4,5);
IPAddress subnet(255, 255, 255, 0);
WebServer server(2424);

const char* ROOMID = "420";

long long timer;
void      setWifi(const char* name, const char* password);

void setup() {
  Serial.begin(115200);
  setWifi(ssid, password);
 
  if ( MDNS.begin("esp32") ){
    Serial.println("MDNS responder started");
  }
  
  server.on("/incoming",       handleIncoming );
  server.on("/",               handleRoot );
  server.on("/identification", handleIdentification );
  
  server.begin();
  Serial.println("HTTP server started");
}


void handleIdentification() {
  Serial.println("Identification requested");
  server.send(200,"text/plain", "room:420");
  return;
}


void handleIncoming() {
  String buffer = "";
  
  if(server.method() != HTTP_POST) {
    Serial.println("Incorrect request received!");
    server.send(403, "text/json", "{\"Message\":\"Incorrect request received!\"}");
    return;
  }
  
  buffer += server.arg(0);
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, buffer);
  
  if(error){
    Serial.println(error.c_str());
    server.send(500, "text/json", "{\"ack\":" + String(error.c_str()) +"\"}");
    return;
  }
  
  if (!doc["device_type"]|| !doc["rssi"] || !doc["person"] || !doc["magno"]) {
    Serial.println("Incorrect fields");
    server.send(500, "text/json", "{\"Message\":\"Incorrect fields received!\"}");
    return;
  }

  if(doc["device_type"] != "beacon") {
    Serial.println("Ping from unexpected recepient!");
    server.send(500, "text/json", "{\"Message\":\"Ping from unexpected recepient!\"}");
    return;
  }
  
  String deviceType = doc["device_type"];
  String rssi       = doc["rssi"];
  String person     = doc["person"];
  String magno      = doc["magno"];

  Serial.println("----------------------------------------");
  Serial.println("Device Type:" + String(deviceType));
  Serial.println("Rssi: " + String(rssi));
  Serial.println("Magno: " + String(magno));
  Serial.println("person: " + String(person));
  Serial.println("----------------------------------------");
  server.send(200, "text/plain", "{\"ack\":\"Incoming data received\"}");
}

void handleRoot() {
  String message = "";
  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  Serial.println(message);
  server.send(200, "text/json", "{\"ack\":\"success\"}");
  return;
}


void setWifi( const char* name, const char* password ) {
  while(!WiFi.softAP(name, password)) {
    Serial.println(".");
    delay(150);
  }
  Serial.println("WIFI < " + String(ssid) + " > ... Started");
  Serial.println(WiFi.softAPIP());
  Serial.println("Server Started");
  return;
}

void loop( void ) {
  server.handleClient();
}
