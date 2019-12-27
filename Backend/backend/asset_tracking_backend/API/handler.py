"""
    This file is intended for handling the elastic search database for any operation.

    The API presented here has a simple interface for ES, which enables the user for
    handling ACID compliancy. 

    Version: 1.0.0
"""


import time
from   elasticsearch import Elasticsearch
from   pprint import pprint
class DataBase:
    def __init__(self, port, ip):
        self.port = port
        self.ip   = ip
        self.es   = Elasticsearch()


    def putIndex(self, index_name):
        try:
            if not isinstance(index_name, str):
                raise ValueError("Index name has to be string.")
            else:
                doc = {
                    "settings": {
                        "number_of_shards": 2,
                        "number_of_replicas": 1
                    }
                }
                res = self.es.indices.create(index=index_name, body=doc)
                if(res["acknowleged"]):
                    return True
                else:
                    return res
        except Exception as e:
            print(e)
            return 



    def getRoomData(self, index_name, room_id, time):
        if not isinstance(index_name, str):            
            return({
              "status_code" : 500,
              "msg"   : "Index name has to be string"
            })
        if not isinstance(room_id, int):            
            return({
              "status_code" : 500,
              "msg"   : "Beacon ID has to be int"
            })
        if not isinstance(time, str):
          return({
            "status_code" : 500,
            "msg"        : "Time delta has to be string!"
          })

        query = {   
          "sort" : {
            "ts" :  {
              "order" : "desc"
            }
          },
          "query": {
              "bool": {
                "must": [
                    {
                    "match_phrase": {
                        "room_id": {
                            "query": room_id
                        }
                      }
                    },
                  {
                  "range": {
                    "ts": {
                      "format": "strict_date_optional_time",
                      "gte": "now-" + str(time),
                      "lte": "now"
                    }
                  }
                }
                ],
                "filter": [
                    {
                    "match_all": {}
                    }
                ],
            "should": [],
            "must_not": []
            }
          }     
        }
        try : 
          response = self.es.search( index=index_name,  body= query )
        except Exception as msg:
          return {
            "status_code" : 500,
            "msg"         : msg
          }
        
        try:
            rname = self.getEntityData("central_list", int(room_id))["data"] 
        except Exception as msg:
          return {
            "status_code"  : 500,
            "msg"          : msg
          }

        buffer = []
        
        for x in response["hits"]["hits"]:
          buf = {}
          buf = x["_source"]
          buf["rname"] = rname
          pprint(x["_source"])
          try :
            res = self.getEntityData("beacon_list", int( x["_source"]["beacon_id"] ))
            if res["status_code"] != 200:
              pass
            else:
              name = res["data"]
          except Exception as msg:
            return {
              "status_code" : 500,
              "msg"    : "Error while retrieving beacon list during aggregation." + str(msg)
            }

          buf["name"] = name
          buffer.append( buf )

        

        if len(buffer) == 0:
          print ("No Beacon information for this room.")
          return {
            "status_code" : 404,
            "msg"          : "No beacon information for this room at this time delta."
          }

        else :
          return {
            "status_code" : 200,
            "data" : buffer
          }


    def getBeaconData(self, index_name, beacon_id, time ):
      if not isinstance( index_name, str ):
        return {
          "status_code" : 500,
          "msg"         : "Index name has to be string."
        }
      
      if not isinstance( beacon_id, int ):
        return{
          "status_code"  : 500,
          "msg"          : "Beacon ID has to be INT."
        }
      
      if not isinstance( time, str ):
        return {
          "status_code"  : 500,
          "msg"          : "Time delta has to be string."
        }

      beacon_list = self.fetchSpecificEntity("beacon_list")
      
      if(beacon_list["status_code"] != 200) :
        return {
          "status_code" : beacon_list["status_code"],
          "msg"         : beacon_list["msg"]
        }

      elif(beacon_list["status_code"] == 200):
        if beacon_id not in beacon_list["data"]:
          return {
            "status_code" : 404,
            "msg"         : "Searching for non-existent id in database."
          }

      
      
      query = {   
          "sort" : {
            "ts" :  {
              "order" : "desc"
            }
          },
          "query": {
              "bool": {
                "must": [
                    {
                    "match_phrase": {
                        "beacon_id": {
                            "query": beacon_id
                        }
                      }
                    },
                  {
                  "range": {
                    "ts": {
                      "format": "strict_date_optional_time",
                      "gte": "now-" + str(time),
                      "lte": "now"
                    }
                  }
                }
                ],
                "filter": [
                    {
                    "match_all": {}
                    }
                ],
            "should": [],
            "must_not": []
            }
          }     
        }
      try:
        response = self.es.search( index=index_name, body= query )
        pprint(response)
      except Exception as e:
        return {
          "status_code" : 500,
          "msg"         : e
        }
      name = ""
      try:
        res = self.getEntityData("beacon_list", int(beacon_id))
        if res["status_code"] != 200:
          pass
        else:
          name = res["data"]
      except Exception as msg:
        return{
          "msg" : "Exception while aggregating data." + str(msg)
        }

      
      buffer = []
      for x in response["hits"]["hits"]:
        buf = {}
        buf = x["_source"]
        buf["name"] = name
        try:
          res = self.getEntityData( "central_list", int( x["_source"]["room_id"] ) )
          if res["status_code"] != 200:
            pass
          else:
            buf["rname"] = res["data"]
          
        except Exception as msg:
          return{
            "msg" : "Exception while aggregating data." + str(msg)
          }
        buffer.append( x["_source"] )
    
      if len(buffer) == 0:
        print ("No Beacon information for this time.")
        return {
          "status_code" : 404,
          "msg"          : "No beacon information for this time delta."
        }

      else :
        return {
          "status_code" : 200,
          "data" : buffer
        }


    def insertDocument(self, index_name, body):
        if not isinstance(index_name, str):
            raise ValueError("Index name has to be string.")
        
        if not isinstance(body, dict):
            raise ValueError("Index body doc types has to be a dict")
        
        res = self.fetchAllDocuments( index_name=index_name )
        buffer= []
        
        for x in res["hits"]["hits"]:
            buffer.append(x["_source"])
        
        if self.checkForExistence(buffer, body["id"]):
            print ("Not Unique")
            return False
        
        response = self.es.index( index=index_name, doc_type="_doc", body=body)
        print (response)
        if not response["result"] == "created":
            print ("not")
            return False
        else:
            print("Database document insert Success!")
            return True
        
    def insertEvent(self, index_name, body):
        if not isinstance(index_name, str):
            raise ValueError("Index name has to be string.")
        if not isinstance(body, dict):
            raise ValueError("Index body doc types has to be a dict")
            
        response = self.es.index( index=index_name, doc_type="_doc", body=body )
        pprint(response)
        if not response["result"] == "created":
            return False
        else:
            return True
       
                       
    def getEntityData(self, index_name, id):
      if not isinstance(index_name, str):
        return {
          "msg" : "Index name must be string.",
          "status_code" : 500
        } 
      if not isinstance(id, int):
        return {
          "msg" : "ID must be INT.",
          "status_code" : 500
        }

      query = {
        "_source":{
          "includes": "name"
        },
        "size" : 1, 
        "query": {
          "bool": {
            "must": [
              {
                "match_phrase": {
                  "id": {
                    "query": int(id)
                  }
                }
              }
            ],
            "filter": [
              {
                "match_all": {}
              }
            ],
            "should": [],
            "must_not": []
          }
        }
      }
      try:
        response = self.es.search( index=index_name, body= query )
      except Exception as msg:
        return {
          "status_code" : 500,
          "msg" : msg
        }
      if len(response["hits"]["hits"]) == 0:
        return({
          "msg" : "ID does not exist in database",
          "status_code" : 404
        })
      else:
        return ({
          "data"        : response["hits"]["hits"][0]["_source"]["name"],
          "status_code" : 200
        })

    def fetchAllDocuments(self, index_name):
        try:
            if not isinstance(index_name, str):
                raise ValueError("Index name has to be string.")
            else:
                doc = {
                    "query":{
                        "match_all" : {}
                    }
                }
                res = self.es.search(index=index_name, body=doc)
                return res
        except Exception as e:
            print (e)

    def fetchSpecificEntity( self, index_name ):
        try:
          buffer = []
          response = self.fetchAllDocuments(index_name)
          for x in response["hits"]["hits"]:
            buffer.append( int(x["_source"]["id"] ))
          pprint(buffer)
          return{
            "status_code" : 200,
            "data"        : buffer
          }

        except Exception as msg:
          return {
            "status_code" : 500,
            "msg"         : msg
          }
        
    def checkForExistence( self, res, id ):
        for x in res:
            if id == x["id"]:
                return True
        return False

          

if __name__ == "__main__":
    db = DataBase(9200, "127.0.0.1")
    #db.putIndex("event_list")
    #db.putIndex("beacon_list") 
    #db.insertDocument("central_list", {"name":"harry", "id":299, "room_assignment":"hall"})
    #print (db.insertDocument("central_list", {"name":"osdsdli", "id":1134341, "room":"toilet"}))
    #pprint(db.getBeaconData("event_list", 12345, "1h"))
    #pprint(db.fetchSpecificEntity("beacon_list"))
    #pprint(db.getEntityData("beacon_list", 199))
    pprint(db.getBeaconData("event_list", 2, "12h"))
    

