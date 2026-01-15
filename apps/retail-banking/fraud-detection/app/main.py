from __future__ import annotations

from datetime import UTC, datetime
import random

from fastapi import FastAPI

from .models import FraudCheckRequest, FraudCheckResponse, HealthResponse


def utc_now() -> datetime:
    return datetime.now(tz=UTC)


def calculate_fraud_score(req: FraudCheckRequest) -> tuple[bool, float, list[str]]:
    """Hardcoded ML logic for demo purposes"""
    score = 0.0
    reasons = []
    
    # Amount-based risk
    if req.amount > 10000:
        score += 0.4
        reasons.append("High transaction amount")
    elif req.amount > 5000:
        score += 0.2
        reasons.append("Moderate transaction amount")
    
    # Time-based risk (simplified - in real ML would use actual timestamps)
    hour = datetime.now().hour
    if hour < 6 or hour > 22:
        score += 0.3
        reasons.append("Unusual transaction time")
    
    # Transaction type risk
    if req.transaction_type == "DEBIT":
        score += 0.1
    
    # Account-based risk (simplified pattern matching)
    if "test" in req.account_id.lower():
        score += 0.5
        reasons.append("Suspicious account pattern")
    
    # Add some randomness to simulate ML model
    score += random.uniform(-0.1, 0.1)
    score = max(0.0, min(1.0, score))
    
    is_fraud = score > 0.7
    return is_fraud, score, reasons


def get_risk_level(score: float) -> str:
    if score <= 0.3:
        return "LOW"
    elif score <= 0.7:
        return "MEDIUM"
    else:
        return "HIGH"


app = FastAPI(title="Fraud Detection Service", version="1.0.0")


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="fraud-detection",
        environment="local",
        time=utc_now(),
    )


@app.get("/ready", response_model=HealthResponse)
def ready() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="fraud-detection",
        environment="local",
        time=utc_now(),
    )


@app.post("/api/v1/check", response_model=FraudCheckResponse)
def check_fraud(req: FraudCheckRequest) -> FraudCheckResponse:
    is_fraud, score, reasons = calculate_fraud_score(req)
    risk_level = get_risk_level(score)
    
    return FraudCheckResponse(
        transaction_id=req.transaction_id,
        is_fraud=is_fraud,
        fraud_score=round(score, 3),
        risk_level=risk_level,
        reasons=reasons,
        checked_at=utc_now(),
    )


@app.get("/api/v1/model/info")
def get_model_info():
    return {
        "model_type": "hardcoded_ml_logic",
        "version": "1.0.0",
        "features": [
            "transaction_amount",
            "transaction_type",
            "transaction_time",
            "account_pattern"
        ],
        "threshold": 0.7,
        "last_trained": "2024-01-01T00:00:00Z"
    }
