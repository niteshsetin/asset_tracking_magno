/*
 * This script is written for the ESP32 chip series.
 * The core funciton of the script is to let the chip set behave as a client node, in a server-clint model.
 * 
 * The client is equipped with a HMC5883 Magnetometer digital compass. The node sends the information from itself to
 * the server.
 * The server then computes the vector based on the distance and the compass reading. The bearing and the heading is used to calculate the
 * the heading in degrees.
 * 
 * This script behaves as the central node that connects to another gateway.
 */
#include <WiFi.h>
#include <WiFiMulti.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>

#include <WiFiClient.h>


#define POST_REQUEST 1
#define GET_REQUEST  2

#define ROOM_ID      1          // Room ID has to be changed.

const char*  ssid;
const char*  password;
WiFiServer   server(4242);


int signalStrength    = 0;
int          error    = 0;
WiFiMulti    WiFiMulti;

void setWiFi(const char* ssid, const char* password);
void connectWifi(const char* ssid, const char* password);

IPAddress local_IP(10, 0, 0, 1);
IPAddress gateway(10, 0, 0, 1);
IPAddress subnet(255, 255, 255, 0);
long long timer;

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n");
  setWiFi("API1", "lawl123456");
}


void connectCentral( const char* ssid, const char* password, JsonDocument redoc  ) {
  String payload;
  
  WiFi.disconnect();
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) {
    delay(10);
    Serial.print("."); 
  }
  long rssi = 0;
  long averageRSSI=0;
  
  for (int i=0;i < 20;i++){
       rssi += WiFi.RSSI();
       delay(5);
  }
  
  averageRSSI=rssi/20;
  redoc["relative_distance"] = averageRSSI;
  Serial.println("RSSI: " + String(averageRSSI) );
  serializeJson(redoc, payload);
  Serial.println();
  Serial.println("Connected to Sentinal central");
  
  if (WiFi.status() == WL_CONNECTED){
    WiFiClient sentinal_client;
    if( !sentinal_client.connect(local_IP, 4242) ){
         Serial.println("Sential node connection error");
     }
    else {
      sentinal_client.println( payload );
      Serial.println("Sending Sentinal node beacon information");
      WiFi.disconnect();  
     }
  }
}

void connectWifi(const char* ssid, const char* password, int requestType, String url, String payload) {
  WiFi.disconnect();
  WiFi.begin(ssid, password);
  
  while(WiFi.status() != WL_CONNECTED) {
    delay(10);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("Connected to gateway");
  if (requestType == 1) {
    // POST Request
    Serial.println("Sending POST Request");
    postRequest(url, payload);
  }
  else if(requestType == 2) {
    // GET request.
    Serial.println("Sending GET Request");
    getRequest(url);
  }
   Serial.println("Operation Complete!");
  WiFi.disconnect();
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

void setWiFi(const char* Name, const char* Password)
{
  ssid      = Name;
  password  = Password;
  if (! WiFi.softAPConfig(local_IP, gateway, subnet)) {
    Serial.println("Allocation Error");
  }
  while (!WiFi.softAP(ssid, password)) {
    Serial.print(".");
    delay(200);
  }
  Serial.println("WIFI < " + String(ssid) + " > ... Started");
  Serial.println(WiFi.softAPIP());
  server.begin();
  Serial.println("Server Started");
}



void postRequest(String request, String body) {
  HTTPClient postHttp;
  postHttp.begin(request);
  if(postHttp.POST(body)){
    Serial.println(postHttp.getString());
  }
  else {
    Serial.println("Status return error");
  }
  postHttp.end();
  return;
}

void getRequest(String request){
  HTTPClient http;
  http.begin(request);
  if(http.GET() > 0){
    Serial.println(http.getString());
  }
  else {
    Serial.println("Status return Error!");
  }
  return;
}


void loop() {
  WiFiClient rxClient;
  rxClient = server.available();
  
    if(rxClient){
      if(rxClient.connected()){
        Serial.print("Client connected: ");
        Serial.println(rxClient.remoteIP());
        String message = rxClient.readStringUntil('\n');
        StaticJsonDocument<512> doc;
        DeserializationError error = deserializeJson(doc, message);
        
        if(error) {
          Serial.println(error.c_str());
          return;
        }
        
        int distance    = doc["distance"];
        int orientation = doc["orientation"];
        int sensor_id   = doc["sensor_id"];

        //---------------------------------------------------
        Serial.print("Distance: " );      
        Serial.println(distance);
        Serial.println("Orientation: " + String(orientation));
        Serial.println("Sensor_id: " + String(sensor_id));
        //---------------------------------------------------
        
        //Transfering deserialized to serialized doc.
        StaticJsonDocument<128> redoc;
        redoc["packet_type"] = "relay";
        redoc["link_name"]   = ROOM_ID;
        redoc["distance"]    = distance;
        redoc["orientation"] = orientation;
        redoc["sensor_id"]   = sensor_id;
        redoc["relative_dist"] = getStrength(20);
        
        rxClient.stop();
        delay(2000);
        connectCentral("API2", "lawl123456", redoc);
      } 
    }

    if ((long long)millis() - (long long)timer >= 3000) {
    Serial.print("Station connected: ");
    Serial.println(WiFi.softAPgetStationNum());
    timer = millis();
  } 
}
