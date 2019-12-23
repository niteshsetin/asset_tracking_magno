from   django.shortcuts             import render
from   django.http                  import HttpResponse, JsonResponse
from   django.views.decorators.csrf import csrf_exempt
import json


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
  "beacon_id" : 12,
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
    else: print ("UNRECOGNISED BEACON ENTERED")
    return JsonResponse({"return":incoming, "message": message, "success" : 1})

@csrf_exempt
def fetch_events(request):
  if request.method == "GET":
    print("Event fetch requested.")
    return JsonResponse(event)
