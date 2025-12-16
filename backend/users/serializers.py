from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.first_name if obj.first_name else obj.username

    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'email', 'role', 'phone', 'address', 'balance']

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD

    def validate(self, attrs):
        # We expect 'email' instead of 'username' in attrs because of username_field override?
        # Actually TokenObtainPairSerializer expects 'username' key but compares against username_field.
        # But frontend will likely send 'email'. Let's handle 'email' key explicitly if needed or rely on frontend sending 'username': email.
        # Standardize: Frontend should send { "email": "...", "password": "..." }
        
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Try to authenticate with email
            user = authenticate(request=self.context.get('request'), email=email, password=password) # Requires custom authentication backend OR we manually find user
            
            # Since we didn't write a custom Auth Backend, we'll manually look up the user first.
            if not user:
                try:
                    user_obj = User.objects.get(email=email)
                    if user_obj.check_password(password):
                        user = user_obj
                except User.DoesNotExist:
                    pass
        
            if not user:
                 raise serializers.ValidationError('No active account found with the given credentials')

            # Now we have a user, let's create tokens.
            # TokenObtainPairSerializer.validate needs 'username' in attrs usually.
            # Let's bypass super().validate() which does authentication and just return tokens manually or mock attrs.
            
            refresh = self.get_token(user)
            data = {}
            data['refresh'] = str(refresh)
            data['access'] = str(refresh.access_token)
            
            # Add custom data
            data['user'] = UserSerializer(user).data
            
            return data
            
        return super().validate(attrs)

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'email', 'password', 'role', 'phone', 'address']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
