from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

from fastapi import FastAPI, Header, HTTPException

from .data import ACCOUNTS, APPROVALS, TREASURY_POSITIONS
from .models import Account, Approval, HealthResponse, TreasuryPosition


def utc_now() -> datetime:
    return datetime.now(tz=UTC)


app = FastAPI(title="Corporate Banking API", version="1.0.0")


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="corp-banking-api",
        environment="local",
        time=utc_now(),
    )


@app.get("/ready", response_model=HealthResponse)
def ready() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="corp-banking-api",
        environment="local",
        time=utc_now(),
    )


@app.get("/api/v1/accounts", response_model=list[Account])
def list_accounts(
    x_corporate_id: Annotated[str | None, Header()] = None,
) -> list[Account]:
    if x_corporate_id is None:
        return ACCOUNTS
    return [a for a in ACCOUNTS if a.corporate_id == x_corporate_id]


@app.get("/api/v1/accounts/{account_id}", response_model=Account)
def get_account(account_id: str) -> Account:
    for a in ACCOUNTS:
        if a.account_id == account_id:
            return a
    raise HTTPException(status_code=404, detail="Account not found")


@app.get("/api/v1/approvals/pending", response_model=list[Approval])
def list_pending_approvals() -> list[Approval]:
    return [a for a in APPROVALS if a.status == "PENDING"]


@app.post("/api/v1/approvals/{approval_id}/approve", response_model=Approval)
def approve(approval_id: str) -> Approval:
    for idx, a in enumerate(APPROVALS):
        if a.approval_id == approval_id:
            updated = a.model_copy(update={"status": "APPROVED"})
            APPROVALS[idx] = updated
            return updated
    raise HTTPException(status_code=404, detail="Approval not found")


@app.post("/api/v1/approvals/{approval_id}/reject", response_model=Approval)
def reject(approval_id: str) -> Approval:
    for idx, a in enumerate(APPROVALS):
        if a.approval_id == approval_id:
            updated = a.model_copy(update={"status": "REJECTED"})
            APPROVALS[idx] = updated
            return updated
    raise HTTPException(status_code=404, detail="Approval not found")


@app.get("/api/v1/treasury/positions", response_model=list[TreasuryPosition])
def treasury_positions() -> list[TreasuryPosition]:
    return TREASURY_POSITIONS
