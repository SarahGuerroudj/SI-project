from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from .models import User
import os


class GoogleAuthView(APIView):
    """
    Endpoint to verify Google OAuth tokens and return JWT tokens.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        credential = request.data.get('credential')
        
        if not credential:
            return Response(
                {'error': 'Google credential token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get Google Client ID from environment or settings
            google_client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None) or os.environ.get('GOOGLE_CLIENT_ID')
            
            if not google_client_id:
                return Response(
                    {'error': 'Google Client ID not configured on server'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Verify the Google token
            idinfo = id_token.verify_oauth2_token(
                credential,
                requests.Request(),
                google_client_id
            )
            
            # Extract user info from the verified token
            email = idinfo.get('email')
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            google_id = idinfo.get('sub')  # Unique Google user ID
            
            if not email:
                return Response(
                    {'error': 'Email not provided by Google'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create user - handle duplicates by getting the first user with this email
            try:
                user = User.objects.filter(email=email).first()
                created = False
                if not user:
                    # Create new user if none exists
                    user = User.objects.create_user(
                        email=email,
                        username=email.split('@')[0] + '_' + google_id[:6],
                        first_name=first_name,
                        last_name=last_name,
                    )
                    user.role = 'client'  # Default role for Google users
                    user.save()
                    created = True
            except Exception as e:
                return Response(
                    {'error': f'Error retrieving/creating user: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Update user info if they already exist (optional)
            if not created:
                if not user.first_name and first_name:
                    user.first_name = first_name
                if not user.last_name and last_name:
                    user.last_name = last_name
                user.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Log the event
            from .audit import AuditLog, get_client_ip
            ip = get_client_ip(request)
            
            if created:
                AuditLog.log(
                    action='resource_created',
                    user=user,
                    resource_type='User',
                    resource_id=user.id,
                    ip_address=ip,
                    severity='low',
                    details={'registration_method': 'google'}
                )
            
            AuditLog.log(
                action='login_success',
                user=user,
                resource_type='User',
                resource_id=user.id,
                ip_address=ip,
                severity='low',
                details={'method': 'google'}
            )
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                },
                'created': created  # Whether this was a new user
            })
            
        except ValueError as e:
            # Invalid token
            return Response(
                {'error': f'Invalid Google token: {str(e)}'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {'error': f'Authentication failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
