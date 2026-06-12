from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models import Booking, BookingStatus
from app.config import settings


def _active_statuses():
    """Statuses that block the villa."""
    return [BookingStatus.pending, BookingStatus.confirmed, BookingStatus.blocked]


def _pending_cutoff() -> datetime:
    return datetime.utcnow() - timedelta(hours=settings.pending_expiry_hours)


def expire_old_pendings(db: Session) -> int:
    """Mark stale pending bookings as cancelled. Returns count expired."""
    cutoff = _pending_cutoff()
    result = (
        db.query(Booking)
        .filter(
            Booking.status == BookingStatus.pending,
            Booking.created_at < cutoff,
        )
        .all()
    )
    for b in result:
        b.status = BookingStatus.cancelled
    db.commit()
    return len(result)


def _overlapping_query(db: Session, check_in: date, check_out: date):
    """Base query for bookings overlapping [check_in, check_out)."""
    cutoff = _pending_cutoff()
    return db.query(Booking).filter(
        Booking.status.in_([BookingStatus.confirmed, BookingStatus.blocked]),
        Booking.check_in < check_out,
        Booking.check_out > check_in,
    ).union(
        db.query(Booking).filter(
            Booking.status == BookingStatus.pending,
            Booking.created_at >= cutoff,
            Booking.check_in < check_out,
            Booking.check_out > check_in,
        )
    )


def is_available(db: Session, check_in: date, check_out: date, exclude_id: int = None) -> bool:
    """Return True if villa is free for [check_in, check_out)."""
    q = _overlapping_query(db, check_in, check_out)
    if exclude_id:
        q = q.filter(Booking.id != exclude_id)
    return q.first() is None


def get_booked_ranges(db: Session) -> list[dict]:
    """Return all active booked date ranges for calendar rendering."""
    cutoff = _pending_cutoff()
    bookings = db.query(Booking).filter(
        or_(
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.blocked]),
            and_(
                Booking.status == BookingStatus.pending,
                Booking.created_at >= cutoff,
            ),
        )
    ).all()
    return [
        {
            "check_in": b.check_in.isoformat(),
            "check_out": b.check_out.isoformat(),
            "status": b.status.value,
        }
        for b in bookings
    ]
