from pydantic import BaseModel, field_validator, model_validator
from datetime import date, time, datetime
from typing import Optional
from app.models import BookingStatus, BookingSource, PropertyType


# ── Public ────────────────────────────────────────────────────────
class BookingCreate(BaseModel):
    check_in: date
    check_out: date
    guests_count: int
    guest_name: str
    guest_phone: str
    arrival_time: Optional[time] = None
    comment: Optional[str] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        if self.check_in < date.today():
            raise ValueError("check_in cannot be in the past")
        if self.guests_count < 1:
            raise ValueError("guests_count must be at least 1")
        return self


class BookingOut(BaseModel):
    id: int
    property_type: PropertyType
    check_in: date
    check_out: date
    guests_count: int
    guest_name: str
    guest_phone: str
    arrival_time: Optional[time]
    status: BookingStatus
    source: BookingSource
    comment: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class AvailabilityOut(BaseModel):
    available: bool
    nights: int


class BookedRange(BaseModel):
    check_in: date
    check_out: date


class ConfigOut(BaseModel):
    max_guests: int
    min_nights: int
    contact_phone: str
    contact_email: str
    contact_instagram: str
    whatsapp_phone: str
    maps_2gis: str
    maps_google: str
    maps_yandex: str
    address_ru: str
    address_en: str
    airport_distances: list


# ── Auth ──────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Admin ─────────────────────────────────────────────────────────
class AdminBookingCreate(BaseModel):
    check_in: date
    check_out: date
    guests_count: int
    guest_name: str
    guest_phone: str
    arrival_time: Optional[time] = None
    comment: Optional[str] = None
    property_type: PropertyType = PropertyType.villa

    @model_validator(mode="after")
    def validate_dates(self):
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        return self


class BlockCreate(BaseModel):
    check_in: date
    check_out: date
    comment: Optional[str] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        return self


class StatusUpdate(BaseModel):
    status: BookingStatus
