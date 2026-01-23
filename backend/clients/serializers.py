from rest_framework import serializers
from .models import Client
from users.serializers import UserSerializer

class ClientSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Client
        fields = ('id', 'user', 'user_details', 'client_type', 'company_name', 'tax_id', 'website')
    
    def validate_user(self, value):
        """Ensure only users with role='client' can have a client profile."""
        if value.role != 'client':
            raise serializers.ValidationError(
                "Only users with role 'client' can have a client profile."
            )
        return value
