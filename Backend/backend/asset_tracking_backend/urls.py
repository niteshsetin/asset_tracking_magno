from django.urls 	import path
from 			   .import views
from django.shortcuts import render, redirect
from django.http      import HttpResponse, JsonResponse


urlpatterns = [
    path('',                  views.init_data,       name='init_data'),
    path('add_beacon',        views.add_beacon,      name='add_beacon'),
    path('fetch_events',      views.fetch_events,    name="fetch_events"),
    path('add_event',         views.add_event,       name="add_event"),
    path('fetch_room_info',   views.get_room_view,   name="get_room_view"),
    path('fetch_beacon_info', views.get_beacon_view, name="get_beacon_view")
]
