"""Run once on startup to ensure admin user exists."""
from app.db import SessionLocal, engine
from app.models import Base, User
from app.routers.auth import hash_password
from app.config import settings

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.admin_email).first()
        if not existing:
            admin = User(
                email=settings.admin_email,
                password_hash=hash_password(settings.admin_password),
            )
            db.add(admin)
            db.commit()
            print(f"[Seed] Admin created: {settings.admin_email}")
        else:
            print(f"[Seed] Admin already exists: {settings.admin_email}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
