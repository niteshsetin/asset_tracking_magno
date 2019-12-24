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
  "beacon_id" : 144,
  "name" : "chool",
  "room" : 1
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
  ratio = -59 - value
  ratio_linear = pow( 10, ratio/100 )
  return math.sqrt( ratio_linear )

def supportAngleC( a, b, c ):
  
  return math.degrees(math.acos( ((a**2) + (b**2) - (c**2)) / (2*a*b)))

def supportArea( a, b, angle ):
  return ( ((a*b) * (math.degrees( math.sin(angle) ) / 2 )) )



@csrf_exempt
def add_event( request ):
  global event
  if request.method == "POST":
    print ("Event add posted.")
    
    incoming_event = json.loads(request.body)
    if incoming_event["beacon_id"] == 0:
      #Checking for existence of beacon ID.

      JsonResponse({"ack" : False, "message" : "False Beacon ID"}, status=414)
    if incoming_event["room_id"] == 0:
      #Checking for existence of Room ID.

      JsonResponse({"ack" : False, "message" : "False Room ID"}, status=414)
    from datetime import datetime
    import dateutil
    from dateutil.parser import parse
    event = incoming_event
    event["ts"] = (dateutil.parser.parse( datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S") ).isoformat())
    pprint(event)
    pprint("Relative_dist: " + str(100*(support_getDistance(incoming_event["dist_relative"]))))
    pprint("Sentinal_dist: " + str(100*(support_getDistance(incoming_event["dist_sentinal"]))))
    pprint("Slave_dist: " + str(100*(support_getDistance(incoming_event["dist_slave"]))))
    angleC = (supportAngleC( round(100*(support_getDistance(incoming_event["dist_slave"])), 2), 
                                           round(100*(support_getDistance(incoming_event["dist_relative"])), 2),
                                           round(100*(support_getDistance(incoming_event["dist_sentinal"])), 2)  )) 
    print(angleC)  
    print( supportArea( round(100*(support_getDistance(incoming_event["dist_slave"])), 2), 
                        round(100*(support_getDistance(incoming_event["dist_relative"])), 2),
                        angleC ))                                    
    return JsonResponse({"ack" : True})
  else :
    return JsonResponse({"ack" : False, "message" : "Wrong method"}, status=403)