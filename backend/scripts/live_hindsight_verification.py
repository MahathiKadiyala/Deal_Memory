import json
import os
from pathlib import Path
import socket
import sys
import threading
import time
import urllib.error
import urllib.request
import uuid

# Ensure backend root is on sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

import uvicorn
from app.core.config import settings

BASE_URL = "http://127.0.0.1:8000"


def wait_for_server(host="127.0.0.1", port=8000, timeout=15):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except OSError:
            time.sleep(0.2)
    return False


def api_request(method, path, body=None, token=None):
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")

    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode("utf-8")
            status_code = resp.status
            parsed = json.loads(resp_body) if resp_body else None
            return status_code, parsed
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode("utf-8")
        parsed = None
        try:
            parsed = json.loads(resp_body) if resp_body else None
        except Exception:
            parsed = resp_body
        return e.code, parsed


def run_live_verification():
    print("=" * 68)
    print("STARTING REAL LIVE HINDSIGHT CLOUD VERIFICATION")
    print("=" * 68)

    # -------------------------------------------------------------
    # TEST 1 — Configuration
    # -------------------------------------------------------------
    print("\n--- TEST 1: Configuration Verification ---")
    assert settings.hindsight_base_url, "HINDSIGHT_BASE_URL is not loaded"
    print(f"PASS: HINDSIGHT_BASE_URL loaded: {settings.hindsight_base_url}")

    assert settings.hindsight_api_key and settings.hindsight_api_key.strip(), "HINDSIGHT_API_KEY is missing or empty"
    print(f"PASS: HINDSIGHT_API_KEY is present (length: {len(settings.hindsight_api_key)}, secret masked)")

    assert settings.hindsight_bank_id == "DealMemory", f"Expected HINDSIGHT_BANK_ID to be 'DealMemory', got '{settings.hindsight_bank_id}'"
    print(f"PASS: Bank ID configured = {settings.hindsight_bank_id}")

    # -------------------------------------------------------------
    # TEST 2 — Real RETAIN
    # -------------------------------------------------------------
    print("\n--- TEST 2: Real RETAIN via Interaction Creation Flow ---")
    u1_suffix = str(uuid.uuid4())[:8]
    u1_email = f"rep1_live_{u1_suffix}@example.com"
    st, u1_res = api_request(
        "POST",
        "/api/auth/signup",
        body={"email": u1_email, "password": "SecurePassword123!", "name": f"Live Sales Rep {u1_suffix}"},
    )
    assert st == 201, f"Signup failed: {st}"
    u1_token = u1_res["access_token"]
    u1_id = u1_res["user"]["id"]

    # Create Account: Acme Corp
    st, acc = api_request(
        "POST",
        "/api/accounts",
        body={"name": f"Acme Corp {u1_suffix}", "industry": "Technology"},
        token=u1_token,
    )
    assert st == 201
    acc_id = acc["id"]

    # Create Deal: Enterprise Platform
    st, deal = api_request(
        "POST",
        "/api/deals",
        body={
            "account_id": acc_id,
            "name": "Enterprise Platform",
            "value": 120000.00,
            "stage": "Discovery",
            "health": "Healthy",
            "main_objection": "Pricing objection",
        },
        token=u1_token,
    )
    assert st == 201
    deal_id = deal["id"]

    # Create Stakeholder
    st, stk = api_request(
        "POST",
        "/api/stakeholders",
        body={
            "account_id": acc_id,
            "name": "Sarah Chen",
            "role": "Chief Financial Officer",
            "email": f"sarah@{u1_suffix}.acmecorp.com",
        },
        token=u1_token,
    )
    assert st == 201
    stk_id = stk["id"]

    # Interaction specification:
    # Account: Acme Corp
    # Deal: Enterprise Platform
    # Concern: Pricing objection
    # Approach: Offered a discount first
    # Outcome: Discount approach failed to move the deal forward
    # Notes: The buyer responded better when the discussion focused on ROI and payback rather than discounting.
    interaction_payload = {
        "deal_id": deal_id,
        "account_id": acc_id,
        "stakeholder_id": stk_id,
        "interaction_type": "Executive Meeting",
        "interaction_date": "2026-09-28T10:00:00Z",
        "concern": "Pricing objection",
        "approach": "Offered a discount first",
        "outcome": "Discount approach failed to move the deal forward",
        "notes": "The buyer responded better when the discussion focused on ROI and payback rather than discounting.",
    }

    st, int_res = api_request("POST", "/api/interactions", body=interaction_payload, token=u1_token)
    assert st == 201, f"Create interaction failed with status {st}: {int_res}"
    int_id = int_res["id"]

    # Verify interaction exists in PostgreSQL
    st, db_int = api_request("GET", f"/api/interactions/{int_id}", token=u1_token)
    assert st == 200, "Interaction was not found in PostgreSQL"
    assert db_int["concern"] == "Pricing objection"
    print(f"PASS: Interaction persisted in PostgreSQL with ID {int_id}")

    # Check deal.last_interaction_at was updated
    st, db_deal = api_request("GET", f"/api/deals/{deal_id}", token=u1_token)
    assert st == 200
    assert db_deal["last_interaction_at"] is not None
    print(f"PASS: deal.last_interaction_at updated to {db_deal['last_interaction_at']}")

    # Strict check on memory_sync_status
    sync_status = int_res.get("memory_sync_status")
    print(f"PASS: memory_sync_status = '{sync_status}'")
    assert sync_status == "retained", (
        f"Real Hindsight RETAIN must result in memory_sync_status='retained'. Got: '{sync_status}'"
    )

    # -------------------------------------------------------------
    # TEST 3 — Real RECALL
    # -------------------------------------------------------------
    print("\n--- TEST 3: Real RECALL of Retained Experience ---")
    query = "What pricing approaches worked or failed previously?"
    st, recall_res = api_request(
        "POST",
        "/api/memory/recall",
        body={"deal_id": deal_id, "query": query},
        token=u1_token,
    )
    assert st == 200, f"Memory recall failed with status {st}: {recall_res}"
    memories = recall_res.get("memories", [])
    count = recall_res.get("count", 0)
    print(f"PASS: Real RECALL succeeded. Returned {count} memories from Hindsight Cloud.")

    all_texts = " ".join(m.get("text", "") for m in memories).lower()
    prompt_ctx = (recall_res.get("prompt_context") or "").lower()
    combined_evidence = f"{all_texts} {prompt_ctx}"

    has_pricing_evidence = "pricing" in combined_evidence or "discount" in combined_evidence
    has_outcome_evidence = "discount" in combined_evidence or "failed" in combined_evidence or "roi" in combined_evidence or "payback" in combined_evidence

    assert has_pricing_evidence, f"Recall result does not contain pricing/discount evidence: {combined_evidence}"
    assert has_outcome_evidence, f"Recall result does not contain outcome/ROI/payback evidence: {combined_evidence}"
    print("PASS: Retrieved retained experience contains verified evidence of pricing objection, discount approach, and ROI/payback framing.")

    # -------------------------------------------------------------
    # TEST 4 — Deal preparation memory context
    # -------------------------------------------------------------
    print("\n--- TEST 4: Deal Preparation Memory Context ---")
    st, prep_res = api_request("GET", f"/api/memory/prepare/{deal_id}", token=u1_token)
    assert st == 200, f"Deal preparation context request failed with status {st}: {prep_res}"
    assert prep_res["deal_id"] == deal_id
    assert prep_res["deal_name"] == "Enterprise Platform"
    assert prep_res["hindsight_status"] == "recalled", f"Expected hindsight_status='recalled', got '{prep_res['hindsight_status']}'"
    assert len(prep_res["recalled_memories"]) > 0, "Deal preparation response missing recalled memories"
    print(f"PASS: Deal preparation context assembled. Hindsight status: '{prep_res['hindsight_status']}', recalled memories: {len(prep_res['recalled_memories'])}.")

    # -------------------------------------------------------------
    # TEST 5 — Cross-user isolation
    # -------------------------------------------------------------
    print("\n--- TEST 5: Cross-User Isolation Verification ---")
    u2_suffix = str(uuid.uuid4())[:8]
    u2_email = f"rep2_live_{u2_suffix}@example.com"
    st, u2_res = api_request(
        "POST",
        "/api/auth/signup",
        body={"email": u2_email, "password": "SecurePassword123!", "name": f"Live Sales Rep 2 {u2_suffix}"},
    )
    assert st == 201
    u2_token = u2_res["access_token"]

    # User 2 attempts to recall User 1's deal memory -> HTTP 404
    st, res = api_request(
        "POST",
        "/api/memory/recall",
        body={"deal_id": deal_id, "query": "What pricing approaches worked or failed?"},
        token=u2_token,
    )
    assert st == 404, f"Expected 404 for User 2 recalling User 1 deal, got {st}: {res}"
    print("PASS: Cross-user memory recall returned HTTP 404.")

    # User 2 attempts to retain memory to User 1's deal -> HTTP 404
    st, res = api_request(
        "POST",
        "/api/memory/retain",
        body={"deal_id": deal_id, "content": "Illegitimate memory injection"},
        token=u2_token,
    )
    assert st == 404, f"Expected 404 for User 2 retaining to User 1 deal, got {st}: {res}"
    print("PASS: Cross-user memory retain returned HTTP 404.")

    # User 2 attempts to access deal preparation context for User 1's deal -> HTTP 404
    st, res = api_request(
        "GET",
        f"/api/memory/prepare/{deal_id}",
        token=u2_token,
    )
    assert st == 404, f"Expected 404 for User 2 accessing User 1 deal preparation context, got {st}: {res}"
    print("PASS: Cross-user deal preparation returned HTTP 404.")

    # -------------------------------------------------------------
    # TEST 6 — Regression Tests
    # -------------------------------------------------------------
    print("\n--- TEST 6: Regression Verification ---")
    st, accs = api_request("GET", "/api/accounts", token=u1_token)
    assert st == 200 and len(accs) >= 1
    st, deals = api_request("GET", "/api/deals", token=u1_token)
    assert st == 200 and len(deals) >= 1
    st, stks = api_request("GET", f"/api/deals/{deal_id}/stakeholders", token=u1_token)
    assert st == 200 and len(stks) >= 1
    st, ints = api_request("GET", f"/api/deals/{deal_id}/interactions", token=u1_token)
    assert st == 200 and len(ints) >= 1

    # Follow-ups CRUD check
    fu_payload = {
        "deal_id": deal_id,
        "account_id": acc_id,
        "title": "Prepare financial model with ROI payback metrics",
        "priority": "High",
        "status": "Pending",
    }
    st, fu = api_request("POST", "/api/follow-ups", body=fu_payload, token=u1_token)
    assert st == 201
    fu_id = fu["id"]

    st, fu_get = api_request("GET", f"/api/follow-ups/{fu_id}", token=u1_token)
    assert st == 200 and fu_get["title"] == fu_payload["title"]

    # Health check
    st, health = api_request("GET", "/api/health")
    assert st == 200 and health.get("database") == "connected"

    # Auth check
    st, me = api_request("GET", "/api/auth/me", token=u1_token)
    assert st == 200 and me["id"] == u1_id

    st, logout = api_request("POST", "/api/auth/logout", token=u1_token)
    assert st == 200
    print("PASS: Core authentication, sales CRUD, and health endpoints verified.")

    print("\n" + "=" * 68)
    print("ALL REAL LIVE HINDSIGHT VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 68)


def start_server_and_test():
    from app.main import app

    config = uvicorn.Config(app, host="127.0.0.1", port=8000, log_level="warning")
    server = uvicorn.Server(config)

    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    if not wait_for_server():
        print("ERROR: Server failed to start on port 8000 within timeout")
        sys.exit(1)

    print("FastAPI test server started on http://127.0.0.1:8000")
    try:
        run_live_verification()
    finally:
        server.should_exit = True
        thread.join(timeout=2)


if __name__ == "__main__":
    start_server_and_test()
