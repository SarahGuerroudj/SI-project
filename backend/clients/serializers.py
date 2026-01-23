from rest_framework import serializers
from .models import Client
from users.serializers import UserSerializer

class ClientSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    # User fields for update
    name = serializers.CharField(source='user.first_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    phone = serializers.CharField(source='user.phone', required=False)
    address = serializers.CharField(source='user.address', required=False)
    balance = serializers.DecimalField(source='user.balance', max_digits=10, decimal_places=2, required=False)

    class Meta:
        model = Client
        fields = ('id', 'user', 'user_details', 'client_type', 'company_name', 'tax_id', 'website', 
                  'name', 'email', 'phone', 'address', 'balance')
    
    def validate_user(self, value):
        """Ensure only users with role='client' can have a client profile."""
        if value.role != 'client':
            raise serializers.ValidationError(
                "Only users with role 'client' can have a client profile."
            )
        return value

    def update(self, instance, validated_data):
        # Extract user data
        user_data = validated_data.pop('user', {})
        
        # Update client instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update associated user instance if user_data is provided
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
            
        return instance
