from fastapi import APIRouter, Request, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Booking, BookingStatus
from app.services.telegram import answer_callback, edit_booking_message
from app.config import settings
import fastapi

router = APIRouter(prefix="/api/webhook", tags=["webhook"])


@router.post("/telegram")
async def telegram_webhook(request: Request):
    """Receive callback_query from Telegram when owner presses a button."""
    data = await request.json()

    # Only handle callback_query (button presses)
    callback = data.get("callback_query")
    if not callback:
        return {"ok": True}

    callback_id   = callback["id"]
    callback_data = callback.get("data", "")
    chat_id       = callback["message"]["chat"]["id"]
    message_id    = callback["message"]["message_id"]

    # Parse action:booking_id
    if ":" not in callback_data:
        return {"ok": True}

    action, booking_id_str = callback_data.split(":", 1)
    try:
        booking_id = int(booking_id_str)
    except ValueError:
        return {"ok": True}

    # Get DB session manually (webhook is not a regular request with dependency)
    db: Session = next(get_db())
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            await answer_callback(callback_id, "❗ Бронирование не найдено")
            return {"ok": True}

        if booking.status not in (BookingStatus.pending, BookingStatus.confirmed):
            await answer_callback(callback_id, "ℹ️ Статус уже изменён")
            return {"ok": True}

        if action == "confirm":
            booking.status = BookingStatus.confirmed
            db.commit()
            await answer_callback(callback_id, "✅ Подтверждено!")
            await edit_booking_message(
                chat_id, message_id, booking_id, "confirmed",
                {"check_in": booking.check_in, "check_out": booking.check_out,
                 "guest_name": booking.guest_name, "guest_phone": booking.guest_phone}
            )

        elif action == "reject":
            booking.status = BookingStatus.cancelled
            db.commit()
            await answer_callback(callback_id, "❌ Отклонено")
            await edit_booking_message(
                chat_id, message_id, booking_id, "cancelled",
                {"check_in": booking.check_in, "check_out": booking.check_out,
                 "guest_name": booking.guest_name, "guest_phone": booking.guest_phone}
            )
    finally:
        db.close()

    return {"ok": True}
