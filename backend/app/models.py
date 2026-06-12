import enum
from datetime import datetime, date, time
from sqlalchemy import (
    Column, Integer, String, Date, Time, DateTime,
    Enum as SAEnum, Text, func
)
from app.db import Base


class PropertyType(str, enum.Enum):
    villa = "villa"
    cottage = "cottage"


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    blocked = "blocked"


class BookingSource(str, enum.Enum):
    web = "web"
    admin = "admin"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    property_type = Column(SAEnum(PropertyType), default=PropertyType.villa, nullable=False)
    check_in = Column(Date, nullable=False, index=True)
    check_out = Column(Date, nullable=False, index=True)
    guests_count = Column(Integer, nullable=False)
    guest_name = Column(String(200), nullable=False)
    guest_phone = Column(String(50), nullable=False)
    arrival_time = Column(Time, nullable=True)
    status = Column(SAEnum(BookingStatus), default=BookingStatus.pending, nullable=False, index=True)
    source = Column(SAEnum(BookingSource), default=BookingSource.web, nullable=False)
    comment = Column(Text, nullable=True)
    tg_message_id = Column(Integer, nullable=True)  # Telegram message id for editing
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
