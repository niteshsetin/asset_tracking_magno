from   django.shortcuts             import render
from   django.http                  import HttpResponse, JsonResponse
from   django.views.decorators.csrf import csrf_exempt
import json
from   pprint                       import pprint
import math
from .API.handler import DataBase
# Create your views here.


db_beacons = []
db_central = []

beacons = {
  "type" : "beacons",
  "beacon_name" : "harry",
  "beacon_id"   : 200
}

db_beacons.append(beacons)

event_list = []
event = {
  
} 
event_list.append(event)

def init_data(request):
    if request.method == "GET":
        buffer_1 = []
        buffer_2 = []      
        db = DataBase( 9200, "127.0.0.1" )
        res = (db.fetchAllDocuments("beacon_list"))
        for x in res["hits"]["hits"]:
          buffer_1.append(x["_source"])
        
        res=(db.fetchAllDocuments("central_list"))
        for x in res["hits"]["hits"]:
          buffer_2.append( x["_source"] )
          
        return JsonResponse({"beacons": buffer_1, "centrals":buffer_2 }, safe=False)
    elif request.method == "POST":
        return JsonResponse({})

@csrf_exempt
def add_beacon(request):
  if request.method == "POST":
    print ("Request Body:")
    print(json.loads(request.body))
    incoming = json.loads(request.body)
    message = ""
    if incoming["type"] == "beacons":
      db = DataBase(9200, "127.0.0.1")
      if not db.insertDocument(index_name= "beacon_list", body=incoming):
        print ("Document index failure")
        message = "Document index failure"
        return JsonResponse({"return":[], "message": message, "success" : 0})
      else:
        message="Document index success."

    elif incoming["type"] == "central":
      db = DataBase(9200, "127.0.0.1")
      res= db.insertDocument(index_name="central_list", body=incoming)
      if not res:
        print (res)
        print ("Document Index Failure.")
        message="Document index failure"
        return JsonResponse({"return":[], "message": message, "success" : 0})
      else :
        message="Document index success."
        pprint(incoming)
        return JsonResponse({"return" : incoming, "message" : message, "success" : 1})
    else: 
          print("UNRECOGNISED BEACON ENTERED")
          
    return JsonResponse({"return":incoming, "message": message, "success" : 1})

@csrf_exempt
def fetch_events( request ):
  if request.method == "GET":
    print("Event fetch requested.")
    pprint(event)
    return JsonResponse( event )
  else :
    print ("Wrong method.")
    return JsonResponse({"message": "Wrong method"}, status=403)


def support_getDistance( value ):
  ratio = -21 - (value)
  ratio_linear = pow( 10, (ratio/(10 * 3)) )
  return ( ratio_linear )

def supportAngleC( a, b, c ):  
  return math.degrees(math.acos( ((a**2) + (b**2) - (c**2)) / (2*a*b)))

def supportArea( a, b, angle ):
  return ( ((a*b) * ( math.sin( math.radians(angle) ) / 2)) )

def supportHeight( area, base ):
  return( (2 * area) / base )

 
@csrf_exempt
def get_room_view( request ):
  if request.method == "POST":
    print ("Get Room View Requested")
    incoming_packet = json.loads(request.body)
    db = DataBase(9200, "127.0.0.1")   
    response = db.getRoomData( index_name="event_list", 
                               room_id=int(incoming_packet["room_id"]),
                               time = incoming_packet["time_delta"] ) 
    if response["status_code"] != 200:
      pprint(response["data"])
      #response["name"] = db.getEntityData( "central_list", response["data"]["data"][0]["central_id"] )
      return JsonResponse({"msg" : response["msg"]}, status = response["status_code"])
    elif response["status_code"] == 200:
      
      return JsonResponse({"msg" : "Successfully found results!", "ack" : True, "data" : response}, status=response["status_code"])
  else:
    return JsonResponse({"msg" : "Incorrect method requested", "ack" : False}, status = 403)


@csrf_exempt
def get_beacon_view( request ) : 
  if request.method == "POST":
    print ("Got beacon view request")
    incoming_packet = json.loads( request.body )  
    db = DataBase(9200, "127.0.0.1")
    response = db.getBeaconData(
                                  index_name= "event_list", 
                                  beacon_id = int(incoming_packet["beacon_id"]), 
                                  time      = incoming_packet["time_delta"] 
                                  )
    if response["status_code"] == 200:
      return JsonResponse( {"msg" : "Successfully found results!", "ack" : True, "data" : response}, status=response["status_code"] )
    else :
      return JsonResponse({"msg" : response["msg"], "ack" : False}, status=response["status_code"])


@csrf_exempt
def add_event( request ):
  global event
  if request.method == "POST":
    print ("Event add posted.")
    incoming_event = json.loads(request.body)

    if incoming_event["beacon_id"] == 0:
      # Checking for existence of beacon ID.
      JsonResponse({"ack" : False, "message" : "False Beacon ID"}, status=414)

    if incoming_event["room_id"] == 0:
      #Checking for existence of Room ID.
      JsonResponse({"ack" : False, "message" : "False Room ID"}, status=414)

    from   datetime        import datetime
    import dateutil
    from   dateutil.parser import parse
    
    event = incoming_event

    event = {
      "ts"  : (dateutil.parser.parse( datetime.utcnow().strftime("%Y-%m-%d %H:%M:%SZ") ).isoformat()),
      "a"   : (support_getDistance(incoming_event["dist_sentinal"])),
      "b"   : (support_getDistance(incoming_event["dist_slave"])),
      "c"   : (support_getDistance(incoming_event["mapped_dist_relative"])),
      "room_id" : incoming_event["room_id"],
      "orientation" : incoming_event["orientation"],
      "beacon_id"   : incoming_event["beacon_id"],   
      }
    pprint( event )

    
    db  = DataBase(9200, "127.0.0.1")           #Database Connection Instance.
    res = db.insertEvent("event_list", event )  

    if not res:
      print("Document index failure")
      JsonResponse({"ack" : False, "message" : "Document Index Failure"}, status=500)

    else:
      print ("Document index success")
      return JsonResponse({"ack" : True, "message" : "Insert success"}, status=200)
      
  else :
    return JsonResponse({"ack" : False, "message" : "Wrong method"}, status=403)