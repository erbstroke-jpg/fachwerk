from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.db import get_db
from app.schemas import (
    BookingCreate, BookingOut, AvailabilityOut, BookedRange, ConfigOut
)
from app.models import Booking, BookingStatus, BookingSource
from app.availability import is_available, get_booked_ranges, expire_old_pendings
from app.services.telegram import notify_new_booking
from app.config import settings

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/booked-dates")
def booked_dates(db: Session = Depends(get_db)):
    """Return all occupied date ranges for calendar rendering."""
    return get_booked_ranges(db)


@router.get("/availability", response_model=AvailabilityOut)
def check_availability(check_in: date, check_out: date, db: Session = Depends(get_db)):
    if check_out <= check_in:
        raise HTTPException(400, "check_out must be after check_in")
    if check_in < date.today():
        raise HTTPException(400, "check_in cannot be in the past")

    nights = (check_out - check_in).days
    if nights < settings.min_nights:
        raise HTTPException(400, f"Minimum stay is {settings.min_nights} night(s)")

    available = is_available(db, check_in, check_out)
    return AvailabilityOut(
        available=available,
        nights=nights,
    )


@router.post("/bookings", response_model=BookingOut, status_code=201)
async def create_booking(data: BookingCreate, db: Session = Depends(get_db)):
    expire_old_pendings(db)

    if data.guests_count > settings.max_guests:
        raise HTTPException(400, f"Maximum {settings.max_guests} guests allowed")

    nights = (data.check_out - data.check_in).days
    if nights < settings.min_nights:
        raise HTTPException(400, f"Minimum stay is {settings.min_nights} night(s)")

    # Race-condition safe availability check inside transaction
    if not is_available(db, data.check_in, data.check_out):
        raise HTTPException(
            409,
            "Эти даты только что забронировали. Пожалуйста, выберите другие даты.",
        )

    booking = Booking(
        check_in=data.check_in,
        check_out=data.check_out,
        guests_count=data.guests_count,
        guest_name=data.guest_name,
        guest_phone=data.guest_phone,
        arrival_time=data.arrival_time,
        comment=data.comment,
        status=BookingStatus.pending,
        source=BookingSource.web,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    await notify_new_booking(
        booking.id,
        {
            "check_in":    booking.check_in,
            "check_out":   booking.check_out,
            "guests":      booking.guests_count,
            "guest_name":  booking.guest_name,
            "guest_phone": booking.guest_phone,
            "comment":     booking.comment,
        }
    )

    return booking


@router.get("/config", response_model=ConfigOut)
def get_config():
    return ConfigOut(
        max_guests=settings.max_guests,
        min_nights=settings.min_nights,
        contact_phone=settings.contact_phone,
        contact_email=settings.contact_email,
        contact_instagram=settings.contact_instagram,
        whatsapp_phone=settings.whatsapp_phone,
        maps_2gis=settings.maps_2gis,
        maps_google=settings.maps_google,
        maps_yandex=settings.maps_yandex,
        address_ru="Кыргызская Республика, Бостери, Кожомбердиева 6а/25, коттедж Ч-13",
        address_en="Kyrgyz Republic, Bosteri, Kojomberdiyeva 6a/25, cottage Ch-13",
        airport_distances=[
            {"name_ru": "Иссык-Куль (Тамчи, IKU)", "name_en": "Issyk-Kul (Tamchi, IKU)", "km": 40, "minutes": 45},
            {"name_ru": "Манас (Бишкек, FRU)", "name_en": "Manas (Bishkek, FRU)", "km": 290, "minutes": 240},
            {"name_ru": "Каракол (UCFP)", "name_en": "Karakol (UCFP)", "km": 133, "minutes": 180},
        ],
    )
