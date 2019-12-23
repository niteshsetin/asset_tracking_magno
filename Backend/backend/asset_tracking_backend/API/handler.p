import time
from elasticsearch import Elasticsearch




class DataBase:
    def __init__(self, port, ip):
        self.port = port
        self.ip   = ip
        self.es   = Elasticsearch()


    def __putIndex(self, index_name):
        try:
            if index_name != str:
                raise ValueError("Index name has to be string.")




if __name__ == "__main__":

    db = DataBase(9200, "127.0.0.1")
    


