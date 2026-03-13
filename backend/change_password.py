from config.database import SessionLocal
from models.models import User
from utils.security import hash_password

# Change password here
NEW_PASSWORD = "admin111"

db = SessionLocal()
admin = db.query(User).filter(User.email == 'admin@shop.com').first()
if admin:
    admin.password_hash = hash_password(NEW_PASSWORD)
    db.commit()
    print(f"Password changed to: {NEW_PASSWORD}")
else:
    print("Admin not found")
db.close()
