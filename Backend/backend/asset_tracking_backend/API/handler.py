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

    def checkForExistence( self, res, id ):
        for x in res:
            if id == x["id"]:
                return True
        return False

           


            


if __name__ == "__main__":
    db = DataBase(9200, "127.0.0.1")
    #db.putIndex("central_list")
    #db.putIndex("beacon_list") 
    #db.insertDocument("central_list", {"name":"harry", "id":299, "room_assignment":"hall"})
    print (db.insertDocument("central_list", {"name":"osdsdli", "id":1134341, "room":"toilet"}))
    
    

