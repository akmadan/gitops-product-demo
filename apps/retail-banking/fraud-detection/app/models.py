from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    environment: str
    time: datetime


class FraudCheckRequest(BaseModel):
    transaction_id: str
    account_id: str
    amount: float
    transaction_type: Literal["DEBIT", "CREDIT"]
    description: str


class FraudCheckResponse(BaseModel):
    transaction_id: str
    is_fraud: bool
    fraud_score: float = Field(ge=0.0, le=1.0)
    risk_level: Literal["LOW", "MEDIUM", "HIGH"]
    reasons: list[str]
    checked_at: datetime
