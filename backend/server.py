from fastapi import FastAPI, APIRouter, Request, Depends, HTTPException, Header
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import time
import uuid
import jwt
import requests
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import Any, List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Config
DISCORD_CLIENT_ID = os.environ.get('DISCORD_CLIENT_ID', '')
DISCORD_CLIENT_SECRET = os.environ.get('DISCORD_CLIENT_SECRET', '')
DISCORD_REDIRECT_URI = os.environ.get('DISCORD_REDIRECT_URI', '')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')
JWT_SECRET = os.environ.get('JWT_SECRET', 'change_me')
JWT_ALGO = 'HS256'

DISCORD_API = 'https://discord.com/api'

# Subscription plans (amounts defined server-side ONLY)
PLANS = {
    "premium": {"amount": 4.99, "name": "Premium", "days": 30},
    "premium_plus": {"amount": 9.99, "name": "Premium+", "days": 30},
}

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------------- Models ----------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class CheckoutRequest(BaseModel):
    plan_id: str
    origin_url: str


class AuctionIngestRequest(BaseModel):
    scannedAt: str
    server: Optional[str] = None
    player: Optional[str] = None
    pagesScanned: Optional[int] = 0
    totalAuctions: Optional[int] = 0
    auctions: List[dict[str, Any]] = Field(default_factory=list)


# ---------------- Auth helpers ----------------
def create_jwt(discord_id: str) -> str:
    payload = {"sub": discord_id, "iat": int(time.time()), "exp": int(time.time()) + 60 * 60 * 24 * 30}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def decode_jwt(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return payload.get("sub")
    except Exception:
        return None


def effective_plan(user: dict) -> str:
    """Downgrade to free if the subscription expired. Dev never expires."""
    plan = user.get("plan", "free")
    if plan == "dev":
        return "dev"
    if plan == "free":
        return "free"
    exp = user.get("plan_expiry")
    if not exp:
        return "free"
    try:
        exp_dt = datetime.fromisoformat(exp)
    except Exception:
        return "free"
    if exp_dt < datetime.now(timezone.utc):
        return "free"
    return plan


async def get_user_public(discord_id: str) -> Optional[dict]:
    user = await db.users.find_one({"id": discord_id}, {"_id": 0})
    if not user:
        return None
    user["plan"] = effective_plan(user)
    user["is_dev"] = user["plan"] == "dev"
    user["is_premium"] = user["plan"] in ("premium", "premium_plus", "dev")
    return user


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Nicht angemeldet")
    token = authorization.split(" ", 1)[1]
    discord_id = decode_jwt(token)
    if not discord_id:
        raise HTTPException(status_code=401, detail="Ungültiges Token")
    user = await get_user_public(discord_id)
    if not user:
        raise HTTPException(status_code=401, detail="Benutzer nicht gefunden")
    return user


# ---------------- Basic routes ----------------
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# ---------------- Auction scanner ingestion ----------------
SCANNER_API_KEY = os.environ.get("SCANNER_API_KEY", "")


def require_scanner_key(x_scanner_key: Optional[str] = Header(None)) -> None:
    if not SCANNER_API_KEY:
        raise HTTPException(status_code=503, detail="SCANNER_API_KEY ist im Backend nicht gesetzt")
    if x_scanner_key != SCANNER_API_KEY:
        raise HTTPException(status_code=401, detail="Ungültiger Scanner-Schlüssel")


def normalize_auction(raw: dict, scanned_at: str) -> dict:
    price = raw.get("price") or {}
    value = price.get("value") if isinstance(price, dict) else price
    count = int(raw.get("count") or 1)
    try:
        total_price = float(value)
    except (TypeError, ValueError):
        total_price = 0.0

    auction_id = str(raw.get("id") or uuid.uuid4())
    return {
        "id": auction_id,
        "name": raw.get("name") or "unknown",
        "displayName": raw.get("displayName") or raw.get("customName") or raw.get("name") or "Unbekannt",
        "customName": raw.get("customName"),
        "count": count,
        "seller": raw.get("seller") or "Unbekannt",
        "price": {"value": total_price, "text": price.get("text") if isinstance(price, dict) else None},
        "unitPrice": (total_price / count) if count else total_price,
        "expires": raw.get("expires"),
        "expiresAt": raw.get("expiresAt"),
        "expiresInSeconds": raw.get("expiresInSeconds"),
        "page": raw.get("page"),
        "slot": raw.get("slot"),
        "enchants": raw.get("enchants") or (raw.get("raw") or {}).get("enchants") or [],
        "firstSeenAt": scanned_at,
        "lastSeenAt": scanned_at,
        "active": True,
    }


@api_router.post("/scanner/auctions")
async def ingest_auctions(body: AuctionIngestRequest, _: None = Depends(require_scanner_key)):
    scanned_at = body.scannedAt or datetime.now(timezone.utc).isoformat()
    normalized = [normalize_auction(a, scanned_at) for a in body.auctions]
    current_ids = [a["id"] for a in normalized]

    previous = await db.auctions.find({"active": True}, {"_id": 0, "id": 1}).to_list(10000)
    previous_ids = {a["id"] for a in previous}
    new_ids = set(current_ids) - previous_ids

    for auction in normalized:
        existing = await db.auctions.find_one(
            {"id": auction["id"]},
            {"_id": 0, "firstSeenAt": 1},
        )
        if existing and existing.get("firstSeenAt"):
            auction["firstSeenAt"] = existing["firstSeenAt"]

        # MongoDB erlaubt nicht, dass das unveränderliche Feld "_id"
        # innerhalb eines Updates gesetzt oder geändert wird.
        clean_auction = {
            key: value
            for key, value in auction.items()
            if key != "_id"
        }

        await db.auctions.update_one(
            {"id": clean_auction["id"]},
            {"$set": clean_auction},
            upsert=True,
        )

    if current_ids:
        await db.auctions.update_many(
            {"active": True, "id": {"$nin": current_ids}},
            {"$set": {"active": False, "removedAt": scanned_at}},
        )
    else:
        await db.auctions.update_many({"active": True}, {"$set": {"active": False, "removedAt": scanned_at}})

    snapshot = {
        "scannedAt": scanned_at,
        "server": body.server,
        "player": body.player,
        "pagesScanned": body.pagesScanned,
        "totalAuctions": len(normalized),
        "newAuctions": len(new_ids),
    }
    # insert_one() ergänzt das übergebene Dictionary direkt um "_id".
    # Deshalb wird hier ausdrücklich eine Kopie eingefügt. Das ursprüngliche
    # snapshot-Dictionary bleibt ohne "_id" und kann sicher für $set verwendet werden.
    await db.auction_scans.insert_one(dict(snapshot))

    scanner_state_update = {
        "id": "auction-scanner",
        **snapshot,
    }
    scanner_state_update.pop("_id", None)

    await db.scanner_state.update_one(
        {"id": "auction-scanner"},
        {"$set": scanner_state_update},
        upsert=True,
    )

    return {"ok": True, **snapshot}


@api_router.get("/auctions")
async def list_auctions(limit: int = 100, search: Optional[str] = None, seller: Optional[str] = None):
    limit = max(1, min(limit, 500))
    query: dict[str, Any] = {"active": True}
    if search:
        query["$or"] = [
            {"displayName": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}},
        ]
    if seller:
        query["seller"] = {"$regex": f"^{seller}$", "$options": "i"}
    rows = await db.auctions.find(query, {"_id": 0}).sort([("firstSeenAt", -1), ("price.value", 1)]).to_list(limit)
    state = await db.scanner_state.find_one({"id": "auction-scanner"}, {"_id": 0})
    return {"auctions": rows, "count": len(rows), "scanner": state}


@api_router.get("/auctions/new")
async def new_auctions(limit: int = 100, minutes: int = 60):
    limit = max(1, min(limit, 500))
    minutes = max(1, min(minutes, 24 * 60))
    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=minutes)).isoformat()
    rows = await db.auctions.find(
        {"active": True, "firstSeenAt": {"$gte": cutoff}}, {"_id": 0}
    ).sort("firstSeenAt", -1).to_list(limit)
    return {"auctions": rows, "count": len(rows), "since": cutoff}


@api_router.get("/scanner/status")
async def scanner_status():
    state = await db.scanner_state.find_one({"id": "auction-scanner"}, {"_id": 0})
    return state or {"status": "waiting_for_first_scan"}


# ---------------- Live Minecraft server status ----------------
_status_cache = {"data": None, "ts": 0.0}

@api_router.get("/server-status")
async def server_status():
    now = time.time()
    if _status_cache["data"] is not None and (now - _status_cache["ts"]) < 20:
        return _status_cache["data"]
    result = {"online": False, "host": "hugosmp.net"}
    try:
        r = requests.get(
            "https://api.mcstatus.io/v2/status/java/hugosmp.net",
            timeout=10, headers={"User-Agent": "HugoSMP-Market-Clone/1.0"},
        )
        d = r.json()
        players = d.get("players") or {}
        version = d.get("version") or {}
        motd = d.get("motd") or {}
        result = {
            "online": bool(d.get("online", False)),
            "host": d.get("host", "hugosmp.net"),
            "players_online": players.get("online"),
            "players_max": players.get("max"),
            "version": version.get("name_clean"),
            "motd": (motd.get("clean") or "").strip(),
        }
    except Exception as e:
        logger_error = str(e)
        result = {"online": False, "host": "hugosmp.net", "error": logger_error}
    _status_cache["data"] = result
    _status_cache["ts"] = now
    return result


# ---------------- Discord OAuth ----------------
@api_router.get("/auth/discord/login")
async def discord_login():
    url = (
        f"{DISCORD_API}/oauth2/authorize?client_id={DISCORD_CLIENT_ID}"
        f"&redirect_uri={requests.utils.quote(DISCORD_REDIRECT_URI, safe='')}"
        f"&response_type=code&scope=identify"
    )
    return {"url": url}


@api_router.get("/auth/discord/callback")
async def discord_callback(code: Optional[str] = None):
    # Determine frontend base from redirect uri (strip /api/...)
    frontend = DISCORD_REDIRECT_URI.split("/api/")[0] or "/"
    if not code:
        return RedirectResponse(url=f"{frontend}/?auth=error")
    try:
        token_res = requests.post(
            f"{DISCORD_API}/oauth2/token",
            data={
                "client_id": DISCORD_CLIENT_ID,
                "client_secret": DISCORD_CLIENT_SECRET,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": DISCORD_REDIRECT_URI,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=15,
        )
        token_res.raise_for_status()
        access_token = token_res.json().get("access_token")

        user_res = requests.get(
            f"{DISCORD_API}/users/@me",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=15,
        )
        user_res.raise_for_status()
        du = user_res.json()

        discord_id = du["id"]
        username = du.get("global_name") or du.get("username") or "Spieler"
        avatar_hash = du.get("avatar")
        avatar_url = (
            f"https://cdn.discordapp.com/avatars/{discord_id}/{avatar_hash}.png"
            if avatar_hash else None
        )

        await db.users.update_one(
            {"id": discord_id},
            {
                "$set": {"username": username, "avatar": avatar_url},
                "$setOnInsert": {
                    "id": discord_id,
                    "plan": "free",
                    "plan_expiry": None,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                },
            },
            upsert=True,
        )
        token = create_jwt(discord_id)
        return RedirectResponse(url=f"{frontend}/?token={token}")
    except Exception as e:
        logger.error(f"discord callback error: {e}")
        return RedirectResponse(url=f"{frontend}/?auth=error")


@api_router.get("/auth/me")
async def auth_me(user: dict = Depends(get_current_user)):
    return user


# ---------------- Support Tickets ----------------
class TicketCreate(BaseModel):
    subject: str
    message: str
    category: Optional[str] = "Allgemein"


class TicketReply(BaseModel):
    message: str


class TicketStatus(BaseModel):
    status: str


@api_router.post("/tickets")
async def create_ticket(body: TicketCreate, user: dict = Depends(get_current_user)):
    if not body.subject.strip() or not body.message.strip():
        raise HTTPException(status_code=400, detail="Betreff und Nachricht erforderlich")
    now = datetime.now(timezone.utc).isoformat()
    ticket = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "username": user.get("username"),
        "avatar": user.get("avatar"),
        "subject": body.subject.strip()[:140],
        "category": body.category or "Allgemein",
        "status": "open",
        "created_at": now,
        "updated_at": now,
        "messages": [
            {"author_id": user["id"], "author_name": user.get("username"), "is_dev": False, "message": body.message.strip(), "created_at": now}
        ],
    }
    await db.tickets.insert_one({**ticket})
    return ticket


@api_router.get("/tickets")
async def list_tickets(user: dict = Depends(get_current_user)):
    query = {} if user.get("is_dev") else {"user_id": user["id"]}
    tickets = await db.tickets.find(query, {"_id": 0}).sort("updated_at", -1).to_list(500)
    return tickets


@api_router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str, user: dict = Depends(get_current_user)):
    ticket = await db.tickets.find_one({"id": ticket_id}, {"_id": 0})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket nicht gefunden")
    if not user.get("is_dev") and ticket["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Kein Zugriff")
    return ticket


@api_router.post("/tickets/{ticket_id}/reply")
async def reply_ticket(ticket_id: str, body: TicketReply, user: dict = Depends(get_current_user)):
    ticket = await db.tickets.find_one({"id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket nicht gefunden")
    if not user.get("is_dev") and ticket["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Kein Zugriff")
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Nachricht erforderlich")
    now = datetime.now(timezone.utc).isoformat()
    msg = {"author_id": user["id"], "author_name": user.get("username"), "is_dev": bool(user.get("is_dev")), "message": body.message.strip(), "created_at": now}
    new_status = ticket.get("status", "open")
    if user.get("is_dev") and new_status == "open":
        new_status = "in_progress"
    await db.tickets.update_one({"id": ticket_id}, {"$push": {"messages": msg}, "$set": {"updated_at": now, "status": new_status}})
    updated = await db.tickets.find_one({"id": ticket_id}, {"_id": 0})
    return updated


@api_router.patch("/tickets/{ticket_id}/status")
async def set_ticket_status(ticket_id: str, body: TicketStatus, user: dict = Depends(get_current_user)):
    if not user.get("is_dev"):
        raise HTTPException(status_code=403, detail="Nur Dev")
    if body.status not in ("open", "in_progress", "closed"):
        raise HTTPException(status_code=400, detail="Ungültiger Status")
    r = await db.tickets.update_one({"id": ticket_id}, {"$set": {"status": body.status, "updated_at": datetime.now(timezone.utc).isoformat()}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ticket nicht gefunden")
    updated = await db.tickets.find_one({"id": ticket_id}, {"_id": 0})
    return updated


# ---------------- App wiring ----------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
