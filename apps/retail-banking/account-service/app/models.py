from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    environment: str
    time: datetime


class Account(BaseModel):
    account_id: str
    customer_id: str
    account_number: str
    balance: float
    currency: str
    status: Literal["ACTIVE", "SUSPENDED", "CLOSED"]
    created_at: datetime
    updated_at: datetime


class CreateAccountRequest(BaseModel):
    customer_id: str
    account_number: str
    initial_balance: float = 0.0
    currency: str = "USD"
