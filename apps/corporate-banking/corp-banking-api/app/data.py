from __future__ import annotations

from datetime import UTC, datetime

from .models import Account, Approval, TreasuryPosition


def now() -> datetime:
    return datetime.now(tz=UTC)


ACCOUNTS: list[Account] = [
    Account(
        account_id="ACCT-10001",
        corporate_id="CORP-RETAILBANK-001",
        name="Operating Account",
        currency="USD",
        balance=12_450_000.25,
        status="ACTIVE",
    ),
    Account(
        account_id="ACCT-10002",
        corporate_id="CORP-RETAILBANK-001",
        name="Payroll Account",
        currency="USD",
        balance=2_100_500.0,
        status="ACTIVE",
    ),
    Account(
        account_id="ACCT-20001",
        corporate_id="CORP-ACME-042",
        name="Treasury Account",
        currency="EUR",
        balance=8_750_100.45,
        status="ACTIVE",
    ),
]


APPROVALS: list[Approval] = [
    Approval(
        approval_id="APR-90001",
        type="PAYMENT",
        requested_by="alice@corp.example",
        requested_at=now(),
        status="PENDING",
        amount=250_000.0,
        currency="USD",
        reference="Vendor payment - INV-7712",
    ),
    Approval(
        approval_id="APR-90002",
        type="BENEFICIARY",
        requested_by="bob@corp.example",
        requested_at=now(),
        status="PENDING",
        reference="Add beneficiary - Contoso Supplies",
    ),
]


TREASURY_POSITIONS: list[TreasuryPosition] = [
    TreasuryPosition(
        book="FX-OPTIONS",
        currency="USD",
        notional=35_000_000.0,
        pnl=125_500.0,
        as_of=now(),
    ),
    TreasuryPosition(
        book="MMF",
        currency="EUR",
        notional=18_000_000.0,
        pnl=-12_250.0,
        as_of=now(),
    ),
]
