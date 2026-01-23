from rest_framework import serializers
from .models import Driver
from users.serializers import UserSerializer

class DriverSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    # User fields for update
    name = serializers.CharField(source='user.first_name', required=False)
    phone = serializers.CharField(source='user.phone', required=False)

    class Meta:
        model = Driver
        fields = ('id', 'user', 'user_details', 'license_number', 'status', 'name', 'phone')
    
    def update(self, instance, validated_data):
        # Extract user data
        user_data = validated_data.pop('user', {})
        
        # Update driver instance
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
