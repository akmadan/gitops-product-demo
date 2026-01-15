from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    environment: str
    time: datetime


class Transaction(BaseModel):
    transaction_id: str
    account_id: str
    amount: float
    transaction_type: Literal["DEBIT", "CREDIT"]
    description: str
    status: Literal["PENDING", "COMPLETED", "FAILED"]
    created_at: datetime
    completed_at: datetime | None = None


class CreateTransactionRequest(BaseModel):
    account_id: str
    amount: float = Field(gt=0)
    transaction_type: Literal["DEBIT", "CREDIT"]
    description: str = ""
