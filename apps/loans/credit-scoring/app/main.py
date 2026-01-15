from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

from fastapi import FastAPI, HTTPException

from .models import CreditScoreRequest, CreditScoreResponse, HealthResponse


def utc_now() -> datetime:
    return datetime.now(tz=UTC)


app = FastAPI(title="Credit Scoring Service", version="1.0.0")


def calculate_score(req: CreditScoreRequest) -> CreditScoreResponse:
    # Hardcoded ML logic for demo purposes
    score = 750  # Base score

    # Income factor
    if req.income_annual < 30000:
        score -= 150
    elif req.income_annual < 60000:
        score -= 50
    elif req.income_annual > 120000:
        score += 50

    # Debt-to-income ratio
    dti = req.debt_existing / max(req.income_annual, 1)
    if dti > 0.5:
        score -= 200
    elif dti > 0.3:
        score -= 100
    elif dti < 0.1:
        score += 50

    # Credit history
    if req.credit_history_length_years < 2:
        score -= 100
    elif req.credit_history_length_years > 10:
        score += 50

    # Delinquencies
    score -= req.recent_delinquencies * 50

    # Employment
    if req.employment_type == "FULL_TIME":
        score += 30
    elif req.employment_type == "UNEMPLOYED":
        score -= 200

    # Clamp to valid range
    score = max(300, min(850, score))

    # Determine grade and decision
    if score >= 750:
        grade, decision = "A", "APPROVED"
    elif score >= 700:
        grade, decision = "B", "APPROVED"
    elif score >= 650:
        grade, decision = "C", "MANUAL_REVIEW"
    elif score >= 600:
        grade, decision = "D", "MANUAL_REVIEW"
    elif score >= 550:
        grade, decision = "E", "REJECTED"
    else:
        grade, decision = "F", "REJECTED"

    # Calculate max loan amount and interest rate
    max_loan = req.income_annual * (4 if decision == "APPROVED" else 2)
    interest_rate = 5.0 + (850 - score) / 50  # Simple inverse relationship

    # Factors for explanation
    factors = []
    if req.income_annual < 60000:
        factors.append("Low income")
    if dti > 0.3:
        factors.append("High debt-to-income ratio")
    if req.recent_delinquencies > 0:
        factors.append("Recent delinquencies")
    if req.credit_history_length_years < 2:
        factors.append("Limited credit history")
    if req.employment_type == "UNEMPLOYED":
        factors.append("Unemployed")
    if score >= 750:
        factors.append("Excellent credit profile")

    return CreditScoreResponse(
        applicant_id=req.applicant_id,
        score=int(score),
        grade=grade,
        decision=decision,
        max_loan_amount=max_loan,
        interest_rate_pct=round(interest_rate, 2),
        factors=factors,
        evaluated_at=utc_now(),
    )


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="credit-scoring",
        environment="local",
        time=utc_now(),
    )


@app.get("/ready", response_model=HealthResponse)
def ready() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="credit-scoring",
        environment="local",
        time=utc_now(),
    )


@app.post("/api/v1/score", response_model=CreditScoreResponse)
def score_application(req: CreditScoreRequest) -> CreditScoreResponse:
    return calculate_score(req)


@app.get("/api/v1/score/{applicant_id}", response_model=CreditScoreResponse)
def get_score(applicant_id: str) -> CreditScoreResponse:
    # Return a mock score for demo purposes
    mock_req = CreditScoreRequest(
        applicant_id=applicant_id,
        income_annual=75000.0,
        debt_existing=15000.0,
        credit_history_length_years=8,
        num_credit_lines=5,
        recent_delinquencies=0,
        employment_type="FULL_TIME",
        loan_amount=25000.0,
        loan_purpose="PERSONAL",
    )
    return calculate_score(mock_req)
