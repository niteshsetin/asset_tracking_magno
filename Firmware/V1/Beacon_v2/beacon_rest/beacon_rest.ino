#include <WiFiClient.h>
#include <ESPmDNS.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <ArduinoJson.h>

long long timer;
WiFiMulti   wifiMulti; 
const char* ssid     = "API2";
const char* password = "lawl123456";
const char* host     = "192.168.4.1";
int         port     = 2424;
void setup() {
  Serial.begin(115200);
  scanNetwork();
}

void scanNetwork() {
  // A function for scanning the network for the best suitable network to connect too.
  WiFi.disconnect();
  WiFi.begin( ssid, password );
  while( WiFi.status() != WL_CONNECTED ) {
    Serial.print( "." );
    delay( 150 );
  }
  Serial.println();
}




void loop() {
  if(WiFi.status() == WL_CONNECTED ) {
    WiFiClient txClient;
    if( !txClient.connect(host, port) ){
          Serial.println( "Connection error" );
       }
    else {
          txClient.println("Content-Type:text/html");
          txClient.println("http://192.168.4.1:2424/identification");
          Serial.println(txClient.readStringUntil('\n'));
          txClient.stop();
      }
  }
  delay(5000);
}
//void loop() {
//    int disconnectCounter = 0;
//    while( 1 ) {
//      if ( (long long)millis() - (long long)timer >= 5000 ) {
//       timer = millis();
//       if( WiFi.status() != WL_CONNECTED ) {
//        scanNetwork();
//       }
//
//        
//       if( (WiFi.status() == WL_CONNECTED) ) {
//        WiFiClient txClient;
//        if( !txClient.connect(host, port) ){
//            Serial.println( "Connection error" );
//        }
//        else {
//          HTTPClient httpClient;
//          
//          httpClient.begin( "http://192.168.4.1:2424/incoming" );
//          httpClient.addHeader("Content-Type","text/plain");
//          httpClient.setReuse(true);
//          httpClient.setTimeout( 5000 ); 
//          //Serial.println( httpClient.GET() );
//          Serial.println(httpClient.POST("{\"device_type\":\"beacon\", \"rssi\":\"34\", \"person\":\"me\", \"magno\":\"45db\"}"));
//          Serial.println( httpClient.getString() );
//          
//          httpClient.end();
//          
//      }
//    }
//    else {
//      disconnectCounter++;
//      if ( disconnectCounter >= 5 ) {
//        Serial.println( "Restarting chip" );
//        ESP.restart();
//      }
//      Serial.println( "Restarting in: " + String(5 - disconnectCounter) );
//    }
//   }
//  }
//}
