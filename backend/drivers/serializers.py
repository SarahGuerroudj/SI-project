from rest_framework import serializers
from .models import Driver
from users.serializers import UserSerializer

class DriverSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Driver
        fields = '__all__'
