from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    environment: str
    time: datetime


class LoanApplication(BaseModel):
    application_id: str
    applicant_id: str
    loan_amount: float
    loan_purpose: Literal["HOME_LOAN", "AUTO_LOAN", "PERSONAL", "BUSINESS"]
    term_months: int
    income_annual: float
    debt_existing: float
    employment_type: Literal["FULL_TIME", "PART_TIME", "SELF_EMPLOYED", "UNEMPLOYED"]
    credit_history_length_years: int
    num_credit_lines: int
    recent_delinquencies: int
    status: Literal["PENDING", "APPROVED", "REJECTED", "MANUAL_REVIEW"]
    created_at: datetime
    updated_at: datetime


class CreditScoreResponse(BaseModel):
    applicant_id: str
    score: int
    grade: str
    decision: str
    max_loan_amount: float
    interest_rate_pct: float
    factors: list[str]
    evaluated_at: datetime


class LoanApplicationResponse(BaseModel):
    application: LoanApplication
    credit_score: CreditScoreResponse | None = None
