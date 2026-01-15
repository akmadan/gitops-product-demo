from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

import httpx
from fastapi import FastAPI, Header, HTTPException

from .models import (
    CreateTransactionRequest,
    HealthResponse,
    Transaction,
)


def utc_now() -> datetime:
    return datetime.now(tz=UTC)


app = FastAPI(title="Transaction Service", version="1.0.0")

# In-memory store for demo
transactions: dict[str, Transaction] = {}

# External services URLs
ACCOUNT_SERVICE_URL = "http://account-service:8091"
FRAUD_DETECTION_URL = "http://fraud-detection:8093"


async def verify_account(account_id: str) -> bool:
    """Verify account exists via account service"""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{ACCOUNT_SERVICE_URL}/api/v1/accounts/{account_id}")
            return resp.status_code == 200
    except Exception:
        return False


async def check_fraud(transaction_data: dict) -> bool:
    """Check transaction for fraud via fraud detection service"""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{FRAUD_DETECTION_URL}/api/v1/check",
                json=transaction_data,
            )
            if resp.status_code == 200:
                result = resp.json()
                return result.get("is_fraud", False)
    except Exception:
        pass
    return False


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="transaction-service",
        environment="local",
        time=utc_now(),
    )


@app.get("/ready", response_model=HealthResponse)
def ready() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="transaction-service",
        environment="local",
        time=utc_now(),
    )


@app.get("/api/v1/transactions", response_model=list[Transaction])
def list_transactions(
    x_account_id: Annotated[str | None, Header()] = None,
) -> list[Transaction]:
    txns = list(transactions.values())
    if x_account_id:
        txns = [t for t in txns if t.account_id == x_account_id]
    return txns


@app.get("/api/v1/transactions/{transaction_id}", response_model=Transaction)
def get_transaction(transaction_id: str) -> Transaction:
    txn = transactions.get(transaction_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn


@app.post("/api/v1/transactions", response_model=Transaction)
async def create_transaction(req: CreateTransactionRequest) -> Transaction:
    # Verify account exists
    if not await verify_account(req.account_id):
        raise HTTPException(status_code=400, detail="Invalid account ID")

    transaction_id = f"TXN-{len(transactions) + 1:06d}"
    now = utc_now()
    
    transaction = Transaction(
        transaction_id=transaction_id,
        account_id=req.account_id,
        amount=req.amount,
        transaction_type=req.transaction_type,
        description=req.description,
        status="PENDING",
        created_at=now,
    )
    
    transactions[transaction_id] = transaction
    
    # Check for fraud
    transaction_data = {
        "transaction_id": transaction_id,
        "account_id": req.account_id,
        "amount": req.amount,
        "transaction_type": req.transaction_type,
        "description": req.description,
    }
    
    is_fraud = await check_fraud(transaction_data)
    
    # Update transaction status
    if is_fraud:
        transaction.status = "FAILED"
        transaction.completed_at = now
    else:
        transaction.status = "COMPLETED"
        transaction.completed_at = now
    
    return transaction
