import httpx
from app.config import settings

API = f"https://api.telegram.org/bot{settings.telegram_bot_token}"


async def _post(method: str, **kwargs) -> dict:
    if not settings.telegram_bot_token or settings.telegram_bot_token == "PENDING":
        return {}
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.post(f"{API}/{method}", json=kwargs)
        return r.json()


async def notify_new_booking(booking_id: int, data: dict):
    """Send new booking notification with Confirm/Reject buttons."""
    check_in  = data["check_in"].strftime("%d.%m.%Y")
    check_out = data["check_out"].strftime("%d.%m.%Y")
    name      = data.get("guest_name", "—")
    phone     = data.get("guest_phone", "—")
    guests    = data.get("guests", "—")
    comment   = data.get("comment") or "—"

    text = (
        f"🏡 <b>Новая заявка на бронирование</b>\n\n"
        f"📅 <b>Заезд:</b> {check_in}\n"
        f"📅 <b>Выезд:</b> {check_out}\n"
        f"👥 <b>Гостей:</b> {guests}\n"
        f"👤 <b>Имя:</b> {name}\n"
        f"📱 <b>Телефон:</b> {phone}\n"
        f"💬 <b>Комментарий:</b> {comment}\n\n"
        f"⏳ Ожидает подтверждения"
    )

    wa_link = f"https://wa.me/{phone.replace('+','').replace(' ','').replace('-','')}"

    keyboard = {
        "inline_keyboard": [
            [
                {"text": "✅ Подтвердить", "callback_data": f"confirm:{booking_id}"},
                {"text": "❌ Отклонить",   "callback_data": f"reject:{booking_id}"},
            ],
            [
                {"text": "📱 Написать гостю в WhatsApp", "url": wa_link},
            ],
            [
                {"text": "📋 Открыть панель управления",
                 "url": f"{settings.admin_url}"},
            ],
        ]
    }

    await _post(
        "sendMessage",
        chat_id=settings.telegram_owner_chat_id,
        text=text,
        parse_mode="HTML",
        reply_markup=keyboard,
    )


async def edit_booking_message(chat_id: int, message_id: int,
                                booking_id: int, status: str, data: dict):
    """Edit the original message after owner presses a button."""
    check_in  = data["check_in"].strftime("%d.%m.%Y")
    check_out = data["check_out"].strftime("%d.%m.%Y")
    name      = data.get("guest_name", "—")
    phone     = data.get("guest_phone", "—")

    if status == "confirmed":
        header = "✅ <b>Бронирование подтверждено</b>"
    else:
        header = "❌ <b>Бронирование отклонено</b>"

    text = (
        f"{header}\n\n"
        f"📅 {check_in} → {check_out}\n"
        f"👤 {name}  📱 {phone}"
    )

    await _post(
        "editMessageText",
        chat_id=chat_id,
        message_id=message_id,
        text=text,
        parse_mode="HTML",
    )


async def answer_callback(callback_query_id: str, text: str):
    await _post("answerCallbackQuery",
                callback_query_id=callback_query_id,
                text=text,
                show_alert=False)
