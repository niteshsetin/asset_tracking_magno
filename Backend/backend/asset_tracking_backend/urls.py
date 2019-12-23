from django.urls 	import path
from 			   .import views
from django.shortcuts import render, redirect
from django.http      import HttpResponse, JsonResponse


urlpatterns = [
    path('', views.init_data, name='init_data'),
    path('add_beacon', views.add_beacon, name='add_beacon'),
    path('fetch_events', views.fetch_events, name="fetch_events")


#ip:port/add_beacon
]
