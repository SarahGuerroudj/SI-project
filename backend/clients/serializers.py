from rest_framework import serializers
from .models import Client
from users.serializers import UserSerializer

class ClientSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Client
        fields = ('id', 'user', 'user_details', 'client_type', 'company_name', 'tax_id', 'website')
