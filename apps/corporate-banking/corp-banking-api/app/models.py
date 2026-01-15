from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


Currency = Literal["USD", "EUR", "INR", "GBP", "JPY"]


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    environment: str
    time: datetime


class Account(BaseModel):
    account_id: str
    corporate_id: str
    name: str
    currency: Currency
    balance: float
    status: Literal["ACTIVE", "SUSPENDED", "CLOSED"]


class Approval(BaseModel):
    approval_id: str
    type: Literal["PAYMENT", "BENEFICIARY", "LIMIT_CHANGE"]
    requested_by: str
    requested_at: datetime
    status: Literal["PENDING", "APPROVED", "REJECTED"]
    amount: float | None = None
    currency: Currency | None = None
    reference: str = Field(default="")


class TreasuryPosition(BaseModel):
    book: str
    currency: Currency
    notional: float
    pnl: float
    as_of: datetime
