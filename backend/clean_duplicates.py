import os
import django
import sys
from django.db.models import Count

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from logistics.models import PricingRule

try:
    dupes = PricingRule.objects.values('service_type').annotate(count=Count('id')).filter(count__gt=1)
    print(f"Duplicate service types count: {dupes.count()}")
    for d in dupes:
        print(f"ServiceType {d['service_type']} has {d['count']} rules")
        
    if dupes.count() > 0:
        print("Cleaning up duplicates...")
        # Keep one rule per service type, delete others
        for d in dupes:
            rules = PricingRule.objects.filter(service_type=d['service_type'])
            # Keep the first one
            to_delete = rules[1:]
            for r in to_delete:
                r.delete()
        print("Duplicates deleted.")
        
except Exception as e:
    print(f"Error: {e}")
