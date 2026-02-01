from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

import httpx
from fastapi import FastAPI, Header, HTTPException
from prometheus_fastapi_instrumentator import Instrumentator

from .models import (
    CreditScoreResponse,
    HealthResponse,
    LoanApplication,
    LoanApplicationResponse,
)


def utc_now() -> datetime:
    return datetime.now(tz=UTC)


app = FastAPI(title="Loans API", version="1.0.0")

# Add Prometheus metrics instrumentation
Instrumentator().instrument(app).expose(app)

# In-memory store for demo
applications: dict[str, LoanApplication] = {}

# External services URLs (adjust for your environment)
CREDIT_SCORING_URL = "http://credit-scoring:8085"
DOCUMENT_PROCESSING_URL = "http://document-processing:8084"


async def get_credit_score(applicant_id: str) -> CreditScoreResponse:
    """Call credit scoring service"""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{CREDIT_SCORING_URL}/api/v1/score/{applicant_id}")
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        # Fallback mock score for demo
        return CreditScoreResponse(
            applicant_id=applicant_id,
            score=700,
            grade="B",
            decision="APPROVED",
            max_loan_amount=100000.0,
            interest_rate_pct=7.5,
            factors=["Mock score - service unavailable"],
            evaluated_at=utc_now(),
        )


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="loans-api",
        environment="local",
        time=utc_now(),
    )


@app.get("/ready", response_model=HealthResponse)
def ready() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="loans-api",
        environment="local",
        time=utc_now(),
    )


@app.get("/api/v1/applications", response_model=list[LoanApplication])
def list_applications(
    x_applicant_id: Annotated[str | None, Header()] = None,
) -> list[LoanApplication]:
    apps = list(applications.values())
    if x_applicant_id:
        apps = [a for a in apps if a.applicant_id == x_applicant_id]
    return apps


@app.get("/api/v1/applications/{application_id}", response_model=LoanApplicationResponse)
def get_application(application_id: str) -> LoanApplicationResponse:
    app = applications.get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    credit_score = None
    try:
        # In real async context, you'd await this
        import asyncio
        credit_score = asyncio.run(get_credit_score(app.applicant_id))
    except Exception:
        pass
    
    return LoanApplicationResponse(application=app, credit_score=credit_score)


@app.post("/api/v1/applications", response_model=LoanApplication)
def create_application(app_data: dict) -> LoanApplication:
    # Generate application ID if not provided
    application_id = app_data.get("application_id", f"APP-{datetime.now().strftime('%Y%m%d%H%M%S')}")
    
    now = utc_now()
    application = LoanApplication(
        application_id=application_id,
        applicant_id=app_data["applicant_id"],
        loan_amount=app_data["loan_amount"],
        loan_purpose=app_data["loan_purpose"],
        term_months=app_data["term_months"],
        income_annual=app_data["income_annual"],
        debt_existing=app_data["debt_existing"],
        employment_type=app_data["employment_type"],
        credit_history_length_years=app_data["credit_history_length_years"],
        num_credit_lines=app_data["num_credit_lines"],
        recent_delinquencies=app_data["recent_delinquencies"],
        status="PENDING",
        created_at=now,
        updated_at=now,
    )
    
    applications[application_id] = application
    return application


@app.post("/api/v1/applications/{application_id}/approve", response_model=LoanApplication)
def approve_application(application_id: str) -> LoanApplication:
    app = applications.get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app.status = "APPROVED"
    app.updated_at = utc_now()
    return app


@app.post("/api/v1/applications/{application_id}/reject", response_model=LoanApplication)
def reject_application(application_id: str) -> LoanApplication:
    app = applications.get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app.status = "REJECTED"
    app.updated_at = utc_now()
    return app
