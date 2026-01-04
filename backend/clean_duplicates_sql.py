import os
import django
import sys
from django.db import connection

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

with connection.cursor() as cursor:
    try:
        # Check for duplicates based on service_type_id
        cursor.execute("""
            SELECT service_type_id, COUNT(*) 
            FROM logistics_pricingrule 
            GROUP BY service_type_id 
            HAVING COUNT(*) > 1
        """)
        dupes = cursor.fetchall()
        print(f"Duplicate groups found: {len(dupes)}")
        
        for d in dupes:
            st_id = d[0]
            print(f"Cleaning duplicates for ServiceType {st_id}")
            # Keep one (latest or earliest, doesn't matter much)
            cursor.execute("""
                DELETE FROM logistics_pricingrule 
                WHERE id NOT IN (
                    SELECT MIN(id) 
                    FROM logistics_pricingrule 
                    WHERE service_type_id = %s
                ) AND service_type_id = %s
            """, [st_id, st_id])
        print("Cleanup done.")
    except Exception as e:
        print(f"Error: {e}")
