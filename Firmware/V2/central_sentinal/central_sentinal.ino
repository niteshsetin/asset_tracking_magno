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
#include <Math.h>
#include <WiFiClient.h>


#define POST_REQUEST 1
#define GET_REQUEST  2

#define ROOM_ID      1          // Room ID has to be changed.

const char*  ssid;
const char*  password;
WiFiServer   server(4242);

int          error    = 0;
WiFiMulti    WiFiMulti;

void setWiFi(const char* ssid, const char* password);
void connectWifi(const char* ssid, const char* password);


struct Position { 
  int distance_1;
  int distance_2;
  int room_id;
  int orientation;
  int beacon_id;
  int relative_dist;
};

Position pos;

IPAddress local_IP(10, 0, 0, 1);
IPAddress gateway(10, 0, 0, 1);
IPAddress subnet(255, 255, 255, 0);
long long timer;

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n");
  setWiFi("API2", "lawl123456");
}


void connectCentral( const char* ssid, const char* password, String payload ) {
  WiFi.disconnect();
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) {
    delay(10);
    Serial.print("."); 
  }
  Serial.println();
  Serial.println("Connected to Sential central");
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

void connectWifi(const char* ssid, const char* password, int requestType, String url, JsonDocument redoc) {
  WiFi.disconnect();
  WiFi.begin(ssid, password);

  int connectionCounter = 0;
  while(WiFi.status() != WL_CONNECTED) {
    delay(10);
    if (connectionCounter > 100){
      connectionCounter = 0;
      return;
    }
    else {
      connectionCounter++;
    }
    Serial.print(".");
    
  }
  Serial.println();
  Serial.println("Connected to gateway");
  String payload = "";
  serializeJson(redoc, payload);
  
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
 
double calculateDistance(int rssi) {
    double ratio_db = -59 - rssi;
    double ratio_linear = pow(10, ratio_db / 10);
    double r = sqrt(ratio_linear);
    return r;
} 

double calculateDistance2(int rssi ) {
  
  return pow(10, ( -69 - (rssi * 2.1))/(10 * 4)) * 100;
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

        if (doc["packet_type"] == "relay") {
          Serial.println("Beacon information received from slave central");
          int distance    = doc["distance"];
          int orientation = doc["orientation"];
          int sensor_id   = doc["sensor_id"];
          int room_id     = doc["link_name"];
          int relative_dist = doc["relative_distance"];
//          Serial.println("------------SLAVE CENTRAL--------------");
//          Serial.println("Slave central: " + String(room_id));
//          Serial.println("Distance: " + String(distance));      
//          Serial.println("Orientation: " + String(orientation));
//          Serial.println("Sensor_id: " + String(sensor_id));
//          Serial.println("---------------------------------------");
          pos.orientation = orientation;
          pos.distance_2 = distance;
          pos.room_id = room_id;
          pos.relative_dist = relative_dist;
        }
        
        else if(doc["packet_type"] == "information") {
          int distance    = doc["distance"];
          int orientation = doc["orientation"];
          int sensor_id   = doc["sensor_id"];
  
//          Serial.println("------------BEACON DIRECT--------------");
//          Serial.print("Distance: " );      
//          Serial.println(distance);
//          Serial.println("Orientation: " + String(orientation));
//          Serial.println("Sensor_id: " + String(sensor_id));
//          Serial.println("---------------------------------------");
          pos.distance_1 = distance; 
          pos.beacon_id = sensor_id;
        }
        else {
          Serial.println("Weird packet type");
        }
        Serial.println("Dist -> Sentinal: " + String(calculateDistance(pos.distance_1)));
        Serial.println("Dist -> Slave: " + String(calculateDistance(pos.distance_2)));
        Serial.println("Relative dist: " +String(calculateDistance(pos.relative_dist)));
        Serial.println("Dist -> Sentinal: " + String((pos.distance_1)));
        Serial.println("Dist -> Slave: " + String((pos.distance_2)));
        Serial.println("Relative dist: " +String((pos.relative_dist)));
        Serial.println("Room ID: " +String (pos.room_id));
        Serial.println("Orientation: " + String(pos.orientation));
        Serial.println("Beacon ID: " + String(pos.beacon_id));
        
        rxClient.stop();
        StaticJsonDocument<128> redoc;
       

        redoc["mapped_dist_relative"] = (po
        Serial.println("Distances: " + String( (long)map(pos.relative_dist, -18, -69, 1, 10)));
        Serial.println("Dist->Slave Mapped: " + String( (long)map(pos.distance_2, -18, -69, 1, 10)));
        Serial.println("Dist->Sentinal Mapped: " + String((long) map(pos.distance_1, -18, -69, 1, 10))); 

        
        redoc["room_id"]       = pos.room_id;
        redoc["orientation"]   = pos.orientation;
        redoc["beacon_id"]     = pos.beacon_id;
        //connectWifi( "UPC4F66D9D", "dRfjcvpb6syT", 1, "http://10.0.0.185:8000/home/add_event", redoc ); 
        connectWifi( "Jupiter_2.4G", "ultimatumgalaxy42", 1, "http://10.0.0.185:8000/home/add_event", redoc ); 

      } 
    }

    if ((long long)millis() - (long long)timer >= 3000) {
    Serial.print("Station connected: ");
    Serial.println(WiFi.softAPgetStationNum());
    timer = millis();
  } 
}
