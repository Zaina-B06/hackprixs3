import os
import uuid
import re
from dotenv import load_dotenv

# Load env
load_dotenv(override=True)
from db.supabase_client import supabase

def setup():
    res = supabase.table('lawyers').select('*').execute()
    if not res.data:
        print("No lawyers found. Creating a dummy lawyer...")
        dummy_uuid = str(uuid.uuid4())
        try:
            supabase.table('lawyers').insert({"id": dummy_uuid, "name": "Adv. Sharma", "email": "sharma@example.com"}).execute()
            lawyer_id = dummy_uuid
            print(f"Created dummy lawyer with ID: {lawyer_id}")
        except Exception as e:
            print(f"Error creating lawyer: {e}")
            lawyer_id = dummy_uuid # Fallback just in case table isn't created
    else:
        lawyer_id = res.data[0]['id']
        print(f"Using existing lawyer ID: {lawyer_id}")
        
    # Update HTML
    html_path = "static/index.html"
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            html = f.read()
        html = re.sub(r'name="lawyer_id"\s+value=".*?"', f'name="lawyer_id" value="{lawyer_id}"', html)
        html = re.sub(r'id="current-lawyer-id">Lawyer ID:\s*.*?</span>', f'id="current-lawyer-id">Lawyer ID: {lawyer_id}</span>', html)
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)
            
    # Update JS
    js_path = "static/app.js"
    if os.path.exists(js_path):
        with open(js_path, "r", encoding="utf-8") as f:
            js = f.read()
        js = re.sub(r"const\s+LAWYER_ID\s*=\s*'.*?';", f"const LAWYER_ID = '{lawyer_id}';", js)
        with open(js_path, "w", encoding="utf-8") as f:
            f.write(js)
            
    print("Updated frontend files with a valid UUID.")

if __name__ == "__main__":
    setup()
