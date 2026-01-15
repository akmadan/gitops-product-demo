from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    environment: str
    time: datetime


class CreditScoreRequest(BaseModel):
    applicant_id: str
    income_annual: float
    debt_existing: float
    credit_history_length_years: int
    num_credit_lines: int
    recent_delinquencies: int
    employment_type: Literal["FULL_TIME", "PART_TIME", "SELF_EMPLOYED", "UNEMPLOYED"]
    loan_amount: float
    loan_purpose: Literal["HOME_LOAN", "AUTO_LOAN", "PERSONAL", "BUSINESS"]


class CreditScoreResponse(BaseModel):
    applicant_id: str
    score: int = Field(ge=300, le=850)
    grade: Literal["A", "B", "C", "D", "E", "F"]
    decision: Literal["APPROVED", "REJECTED", "MANUAL_REVIEW"]
    max_loan_amount: float
    interest_rate_pct: float
    factors: list[str]
    evaluated_at: datetime
