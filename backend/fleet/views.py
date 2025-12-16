from rest_framework import viewsets
from .models import Vehicle, Driver, Incident
from .serializers import VehicleSerializer, DriverSerializer, IncidentSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer

class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all().order_by('-date')
    serializer_class = IncidentSerializer
