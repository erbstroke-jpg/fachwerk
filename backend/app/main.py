from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session
import httpx

from app.db import SessionLocal
from app.availability import expire_old_pendings
from app.config import settings
from app.routers import public, auth, admin, webhook


def run_expiry_job():
    db: Session = SessionLocal()
    try:
        n = expire_old_pendings(db)
        if n > 0:
            print(f"[Scheduler] Expired {n} stale pending booking(s)")
    finally:
        db.close()


scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(run_expiry_job, "interval", hours=1, id="expire_pendings")
    scheduler.start()

    # Register Telegram webhook if configured
    if (settings.telegram_bot_token != "PENDING"
            and settings.telegram_webhook_url != "PENDING"):
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                f"https://api.telegram.org/bot{settings.telegram_bot_token}/setWebhook",
                json={"url": settings.telegram_webhook_url,
                      "allowed_updates": ["callback_query"]}
            )

    yield
    scheduler.shutdown()


app = FastAPI(title="Fachwerk IssykKul API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.kg", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(webhook.router)


@app.get("/health")
def health():
    return {"status": "ok"}
