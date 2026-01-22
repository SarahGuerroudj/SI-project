from rest_framework import serializers
from .models import Complaint, ComplaintItem
from users.serializers import UserSerializer

class ComplaintItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintItem
        fields = ['id', 'type', 'entity_id', 'description']

class ComplaintSerializer(serializers.ModelSerializer):
    client_details = UserSerializer(source='client', read_only=True)
    related_items = ComplaintItemSerializer(many=True, read_only=True)
    
    related_items_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Complaint
        fields = '__all__'
    
    def create(self, validated_data):
        items_data = validated_data.pop('related_items_data', [])
        complaint = Complaint.objects.create(**validated_data)
        
        for item_data in items_data:
            ComplaintItem.objects.create(complaint=complaint, **item_data)
            
        return complaint
