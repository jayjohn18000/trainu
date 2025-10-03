import os
import datetime as dt
from supabase import create_client

url = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
sb = create_client(url, key)

# Insert sample trainer and client (assumes auth users exist or use Admin API)
sb.table("users_ext").insert({
  "user_id": "00000000-0000-0000-0000-000000000001",
  "role": "trainer",
  "ghl_contact_id": "sample-contact-1"
}).execute()

sb.table("trainers").insert({
  "user_id": "00000000-0000-0000-0000-000000000001",
  "slug": "alex-strong",
  "first_name": "Alex",
  "last_name": "Strong",
  "city": "Chicago",
  "state": "IL",
  "specialties": ["powerlifting","youth"],
  "accepts_minors": True
}).execute()

print("Seed complete.")
