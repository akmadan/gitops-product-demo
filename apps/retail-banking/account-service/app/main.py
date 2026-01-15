from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

from fastapi import FastAPI, Header, HTTPException

from .models import Account, CreateAccountRequest, HealthResponse


def utc_now() -> datetime:
    return datetime.now(tz=UTC)


app = FastAPI(title="Account Service", version="1.0.0")

# In-memory store for demo
accounts: dict[str, Account] = {}

# Initialize with mock data
mock_accounts = [
    {
        "account_id": "ACC-001",
        "customer_id": "CUST-001",
        "account_number": "1001",
        "balance": 5420.75,
        "currency": "USD",
        "status": "ACTIVE",
    },
    {
        "account_id": "ACC-002",
        "customer_id": "CUST-002",
        "account_number": "1002",
        "balance": 12850.20,
        "currency": "USD",
        "status": "ACTIVE",
    },
]

for acc in mock_accounts:
    accounts[acc["account_id"]] = Account(
        **acc,
        created_at=utc_now(),
        updated_at=utc_now(),
    )


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="account-service",
        environment="local",
        time=utc_now(),
    )


@app.get("/ready", response_model=HealthResponse)
def ready() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="account-service",
        environment="local",
        time=utc_now(),
    )


@app.get("/api/v1/accounts", response_model=list[Account])
def list_accounts(
    x_customer_id: Annotated[str | None, Header()] = None,
) -> list[Account]:
    accs = list(accounts.values())
    if x_customer_id:
        accs = [a for a in accs if a.customer_id == x_customer_id]
    return accs


@app.get("/api/v1/accounts/{account_id}", response_model=Account)
def get_account(account_id: str) -> Account:
    account = accounts.get(account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@app.post("/api/v1/accounts", response_model=Account)
def create_account(req: CreateAccountRequest) -> Account:
    account_id = f"ACC-{len(accounts) + 1:03d}"
    now = utc_now()
    account = Account(
        account_id=account_id,
        customer_id=req.customer_id,
        account_number=req.account_number,
        balance=req.initial_balance,
        currency=req.currency,
        status="ACTIVE",
        created_at=now,
        updated_at=now,
    )
    accounts[account_id] = account
    return account


@app.put("/api/v1/accounts/{account_id}/suspend", response_model=Account)
def suspend_account(account_id: str) -> Account:
    account = accounts.get(account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    account.status = "SUSPENDED"
    account.updated_at = utc_now()
    return account


@app.put("/api/v1/accounts/{account_id}/activate", response_model=Account)
def activate_account(account_id: str) -> Account:
    account = accounts.get(account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    account.status = "ACTIVE"
    account.updated_at = utc_now()
    return account
