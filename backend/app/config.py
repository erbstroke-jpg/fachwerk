from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+psycopg://fachwerk:password@localhost:5432/fachwerk"

    # JWT
    jwt_secret: str = "dev-secret-change-in-prod"
    jwt_expire_minutes: int = 1440

    # Auth cookie. Must be False when serving over plain HTTP (no domain/TLS),
    # otherwise the browser drops the Secure cookie and admin login silently fails.
    # Set to True once you put the site behind HTTPS.
    cookie_secure: bool = True

    # Admin
    admin_email: str = "admin@fachwerk.kg"
    admin_password: str = "admin"

    # Telegram
    telegram_bot_token: str = "PENDING"
    telegram_owner_chat_id: str = "PENDING"
    telegram_webhook_url: str = "PENDING"  # e.g. https://yourdomain.kg/api/webhook/telegram

    # Villa
    villa_price_per_night: int = 25000
    cottage_price_per_night: int = 18000
    max_guests: int = 10
    min_nights: int = 1

    # Contacts
    whatsapp_phone: str = "996880111196"
    contact_phone: str = "+996 880 111 1 96"
    contact_email: str = "info@fachwerk.kg"
    contact_instagram: str = "fachwerkk_"
    admin_url: str = "https://yourdomain.kg/admin"

    # Maps
    maps_2gis: str = "https://2gis.kg/bishkek/geo/70030076136904677/77.180550,42.642504"
    maps_google: str = "https://maps.app.goo.gl/Xw7oB1VUK7MuMgfs8"
    maps_yandex: str = "https://yandex.com/maps/?text=42.642136,77.179484"

    # Pending expiry (hours)
    pending_expiry_hours: int = 24

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
