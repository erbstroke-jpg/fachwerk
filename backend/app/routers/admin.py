from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional

from app.db import get_db
from app.models import Booking, BookingStatus, BookingSource, PropertyType, User
from app.schemas import (
    BookingOut, AdminBookingCreate, BlockCreate, StatusUpdate
)
from app.availability import is_available, expire_old_pendings
from app.routers.auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/bookings", response_model=list[BookingOut])
def list_bookings(
    status: Optional[BookingStatus] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    expire_old_pendings(db)
    q = db.query(Booking)
    if status:
        q = q.filter(Booking.status == status)
    if from_date:
        q = q.filter(Booking.check_out >= from_date)
    if to_date:
        q = q.filter(Booking.check_in <= to_date)
    return q.order_by(Booking.check_in).all()


@router.post("/bookings", response_model=BookingOut, status_code=201)
def create_admin_booking(
    data: AdminBookingCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    """Manual booking from admin (offline / phone call). Instantly confirmed."""
    if not is_available(db, data.check_in, data.check_out):
        raise HTTPException(409, "Эти даты уже заняты.")

    booking = Booking(
        property_type=data.property_type,
        check_in=data.check_in,
        check_out=data.check_out,
        guests_count=data.guests_count,
        guest_name=data.guest_name,
        guest_phone=data.guest_phone,
        arrival_time=data.arrival_time,
        comment=data.comment,
        status=BookingStatus.confirmed,
        source=BookingSource.admin,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.patch("/bookings/{booking_id}", response_model=BookingOut)
def update_booking_status(
    booking_id: int,
    data: StatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(404, "Бронь не найдена")
    if data.status == BookingStatus.confirmed and booking.status == BookingStatus.pending:
        # Re-check availability excluding this booking
        if not is_available(db, booking.check_in, booking.check_out, exclude_id=booking_id):
            raise HTTPException(409, "Даты заняты другой подтверждённой бронью.")
    booking.status = data.status
    db.commit()
    db.refresh(booking)
    return booking


@router.post("/blocks", response_model=BookingOut, status_code=201)
def block_dates(
    data: BlockCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    """Block a date range (maintenance, personal use, etc.)."""
    if not is_available(db, data.check_in, data.check_out):
        raise HTTPException(409, "На эти даты уже есть бронь.")

    block = Booking(
        check_in=data.check_in,
        check_out=data.check_out,
        guests_count=0,
        guest_name="Блокировка",
        guest_phone="—",
        comment=data.comment,
        status=BookingStatus.blocked,
        source=BookingSource.admin,
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


@router.delete("/blocks/{booking_id}")
def delete_block(
    booking_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    booking = db.get(Booking, booking_id)
    if not booking or booking.status != BookingStatus.blocked:
        raise HTTPException(404, "Блокировка не найдена")
    db.delete(booking)
    db.commit()
    return {"ok": True}


@router.get("/calendar")
def calendar_view(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2024),
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    """Return all bookings that fall within a given month for calendar rendering."""
    expire_old_pendings(db)
    from datetime import date as dt_date
    import calendar as cal

    last_day = cal.monthrange(year, month)[1]
    month_start = dt_date(year, month, 1)
    month_end = dt_date(year, month, last_day)

    bookings = (
        db.query(Booking)
        .filter(
            Booking.status != BookingStatus.cancelled,
            Booking.check_in <= month_end,
            Booking.check_out > month_start,
        )
        .order_by(Booking.check_in)
        .all()
    )
    return [
        {
            "id": b.id,
            "check_in": b.check_in.isoformat(),
            "check_out": b.check_out.isoformat(),
            "status": b.status.value,
            "guest_name": b.guest_name,
            "guest_phone": b.guest_phone,
            "guests_count": b.guests_count,
            "source": b.source.value,
        }
        for b in bookings
    ]
