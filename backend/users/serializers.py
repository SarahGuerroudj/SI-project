from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .audit import AuditLog

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.first_name if obj.first_name else obj.username

    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'email', 'role', 'phone', 'address', 'balance', 'first_name', 'last_name', 'bio']
        read_only_fields = ['id']  # balance is now editable via profile if needed

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ['id', 'timestamp'] # Only ID and Timestamp are truly system-generated

class DetailedAuditLogSerializer(serializers.ModelSerializer):
    """Serializer used for admin reporting with expanded details"""
    class Meta:
        model = AuditLog
        fields = '__all__'

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove the default username field since we use email
        if 'username' in self.fields:
            del self.fields['username']

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                 raise serializers.ValidationError('No active account found with the given credentials')

            if not user.check_password(password):
                 raise serializers.ValidationError('No active account found with the given credentials')

            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')

            refresh = self.get_token(user)
            data = {}
            data['refresh'] = str(refresh)
            data['access'] = str(refresh.access_token)
            
            # Add custom data that the frontend expects
            data['user'] = UserSerializer(user).data
            
            return data
            
        raise serializers.ValidationError('Email and password are required')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    username = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'email', 'password', 'role', 'phone', 'address']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        # If username is not provided, use email as username
        if 'username' not in validated_data or not validated_data['username']:
            validated_data['username'] = validated_data['email']
            
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
