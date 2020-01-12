#include "HMC5883L.h"
#include <Wire.h>
#define MPU_ADDR  0x68

struct MPU {
  int address;
  int16_t ACX;
  int16_t ACY;
  int16_t ACZ;
  int16_t TMP;
  int16_t GYX;
  int16_t GYY;
  int16_t GYZ;

  MPU( int address ) {
    this->address = address;
  };

  void MPUInit() {

    Wire.beginTransmission(this->address);
    Wire.write( 0x6B );
    Wire.write( 0 );
    Wire.endTransmission( true );

  };

  MPU readACC() {
    this->MPUInit();
    Wire.beginTransmission( this->address );
    Wire.write( 0x3B);
    Wire.endTransmission( false );
    Wire.requestFrom( this->address, 14, true );
    MPU buf( this->address );
    buf.ACX = Wire.read() << 8 | Wire.read()/8192;
    buf.ACY = Wire.read() << 8 | Wire.read()/8192;
    buf.ACZ = Wire.read() << 8 | Wire.read()/8192;
    return buf;
  };
};


QMC5883L compass;
MPU      mpu( 0x68 );


struct Vector
{
  double roll;
  double pitch;
  double azimuth;
};

double returnPositionVector() {
  int16_t mag_x, mag_y, mag_z, mag_t;
  
  if (!compass.readRaw(&mag_x, &mag_y, &mag_z, &mag_t)) {
    Serial.println("Compass Reading Error");
  };
  
  
  double pitch = atan2((double) - mpu.readACC().ACX, sqrt((long)mpu.readACC().ACZ * (long)mpu.readACC().ACZ + (long)mpu.readACC().ACY * (long)mpu.readACC().ACY));
  double roll  = atan2((double)mpu.readACC().ACY, sqrt((long)mpu.readACC().ACZ * (long)mpu.readACC().ACZ  + (long)mpu.readACC().ACX * (long)mpu.readACC().ACX));

  double X_h = (double)mag_x * cos(pitch) + (double)mag_y * sin(roll) * sin(pitch) + (double)mag_z * cos(roll) * sin(pitch);
  double Y_h = (double)mag_y * cos(roll) - (double)mag_z * sin(roll);
  double azimuth = atan2(Y_h, X_h);
  
  if (azimuth < 0) {
    azimuth = 2 * PI + azimuth;
  }

  int x = 32 + 24 * sin(azimuth);
  int y = 32 - 24 * cos(azimuth);

  return azimuth;
}


void setup()
{
  Wire.begin();
  compass.init();
  compass.setSamplingRate(50);
 
  Serial.begin(115200);
  Serial.println("QMC5883L Compass Demo");
  Serial.println("Turn compass in all directions to calibrate....");
}

void loop()
{
  
  Serial.println("Azimuth: " + String(returnPositionVector() * 180 / 3.14));
  delay(150);
}
