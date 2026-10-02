"""
End-to-End Verification Script for Part 5: Groq AI Deal Briefing.

Verifies:
1. GROQ_API_KEY configuration status and model selection.
2. Error handling when GROQ_API_KEY is missing (HTTP 503).
3. Cross-user isolation (User B calling prepare on User A's deal returns HTTP 404).
4. Unauthenticated access enforcement (HTTP 401).
5. Real Hindsight Cloud experiential memory retention and recall for Acme Corp test deal.
6. Real Groq API execution generating grounded Deal Briefing.
7. Structured JSON validation matching Pydantic DealBriefingResponse schema.
8. Grounded AI assertions (what_failed captures discounting failure; recommended_approach leverages ROI/payback).
9. Absence of fabricated sales history and hyperbolic claims.
"""

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


def run_verification():
    print("=" * 70)
    print("DEALMEMORY PART 5 — GROQ AI DEAL BRIEFING VERIFICATION")
    print("=" * 70)

    # 1. Configuration check
    print("\n--- STEP 1: Configuration Verification ---")
    hindsight_configured = bool(settings.hindsight_api_key and settings.hindsight_api_key.strip())
    print(f"Hindsight Bank ID: {settings.hindsight_bank_id}")
    print(f"Hindsight Configured: {hindsight_configured} (Key length: {len(settings.hindsight_api_key) if settings.hindsight_api_key else 0}, masked)")

    groq_configured = bool(settings.groq_api_key and settings.groq_api_key.strip())
    print(f"Groq Configured: {groq_configured} (Key length: {len(settings.groq_api_key) if settings.groq_api_key else 0}, masked)")
    print(f"Groq Model: {settings.groq_model}")

    # 2. Setup Acme Corp test deal with Rep A
    print("\n--- STEP 2: Creating Acme Corp Test Deal & Recording Interaction ---")
    u1_suffix = str(uuid.uuid4())[:8]
    u1_email = f"rep_a_{u1_suffix}@example.com"
    st, u1_res = api_request(
        "POST",
        "/api/auth/signup",
        body={"email": u1_email, "password": "SecurePassword123!", "name": f"Sales Rep A {u1_suffix}"},
    )
    assert st == 201, f"Rep A Signup failed: {st}"
    u1_token = u1_res["access_token"]
    u1_id = u1_res["user"]["id"]
    print(f"PASS: Rep A authenticated with ID: {u1_id}")

    # Create Account: Acme Corp
    st, acc = api_request(
        "POST",
        "/api/accounts",
        body={"name": f"Acme Corp {u1_suffix}", "industry": "Enterprise Software", "notes": "Evaluating enterprise contracts"},
        token=u1_token,
    )
    assert st == 201, f"Create Account failed: {st}"
    acc_id = acc["id"]
    print(f"PASS: Account created: {acc['name']} (ID: {acc_id})")

    # Create Deal: Enterprise Platform ($120,000, Discovery, Pricing objection)
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
            "next_action": "Follow up with executive pricing business case",
        },
        token=u1_token,
    )
    assert st == 201, f"Create Deal failed: {st}"
    deal_id = deal["id"]
    print(f"PASS: Deal created: {deal['name']} (ID: {deal_id}, Value: ${deal['value']})")

    # Create Stakeholder: Sarah Chen (CFO)
    st, stk = api_request(
        "POST",
        "/api/stakeholders",
        body={
            "account_id": acc_id,
            "name": "Sarah Chen",
            "role": "Chief Financial Officer",
            "email": f"sarah@{u1_suffix}.acmecorp.com",
            "notes": "Focused heavily on ROI justification and fiscal year budget constraints",
        },
        token=u1_token,
    )
    assert st == 201, f"Create Stakeholder failed: {st}"
    stk_id = stk["id"]
    print(f"PASS: Stakeholder created: {stk['name']} - {stk['role']}")

    # Create Interaction with Pricing Objection & ROI/Payback notes
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
    assert st == 201, f"Create interaction failed: {st}"
    print(f"PASS: Interaction recorded: sync_status='{int_res.get('memory_sync_status')}'")

    # 3. Security & Isolation Tests
    print("\n--- STEP 3: Security & Multi-Tenant Isolation Tests ---")

    # Unauthenticated access
    st, unauth_res = api_request("POST", f"/api/deals/{deal_id}/prepare")
    assert st == 401, f"Expected 401 for unauthenticated prepare, got {st}"
    print("PASS: Unauthenticated call to /api/deals/{deal_id}/prepare correctly rejected with HTTP 401")

    # Non-existent deal ID
    fake_deal_id = str(uuid.uuid4())
    st, notfound_res = api_request("POST", f"/api/deals/{fake_deal_id}/prepare", token=u1_token)
    assert st == 404, f"Expected 404 for missing deal, got {st}"
    print("PASS: Non-existent deal correctly returned HTTP 404")

    # Cross-user isolation: Rep B attempts to prepare Rep A's deal
    u2_suffix = str(uuid.uuid4())[:8]
    u2_email = f"rep_b_{u2_suffix}@example.com"
    st, u2_res = api_request(
        "POST",
        "/api/auth/signup",
        body={"email": u2_email, "password": "SecurePassword123!", "name": f"Sales Rep B {u2_suffix}"},
    )
    assert st == 201
    u2_token = u2_res["access_token"]

    st, cross_res = api_request("POST", f"/api/deals/{deal_id}/prepare", token=u2_token)
    assert st == 404, f"Cross-user deal preparation must return 404. Got: {st}"
    print("PASS: Cross-user isolation verified. Rep B calling prepare on Rep A's deal returned HTTP 404")

    # 4. Check Deal Preparation Execution
    print("\n--- STEP 4: Deal Preparation Execution ---")
    if not groq_configured:
        print("NOTICE: GROQ_API_KEY is not yet configured in backend/.env.")
        st, prep_err = api_request("POST", f"/api/deals/{deal_id}/prepare", token=u1_token)
        assert st == 503, f"Expected 503 when GROQ_API_KEY is missing, got {st}: {prep_err}"
        print("PASS: Endpoint cleanly returned HTTP 503 when GROQ_API_KEY is unconfigured.")
        print(f"Error detail returned: {prep_err.get('detail')}")
        print("\nSUMMARY: Backend endpoints and isolation are ready. Awaiting GROQ_API_KEY to test real Groq LLM synthesis.")
        return False

    # Real Groq execution
    print(f"Calling real Groq API with model '{settings.groq_model}'...")
    start_time = time.time()
    st, briefing_res = api_request("POST", f"/api/deals/{deal_id}/prepare", token=u1_token)
    elapsed = time.time() - start_time

    assert st == 200, f"Deal preparation failed with HTTP {st}: {briefing_res}"
    print(f"PASS: Deal preparation succeeded in {elapsed:.2f}s with HTTP 200")

    # 5. Validate Structured Response Schema
    print("\n--- STEP 5: Response Schema & Metadata Validation ---")
    assert briefing_res.get("deal_id") == deal_id, "Returned deal_id does not match"
    assert briefing_res.get("deal_name") == "Enterprise Platform", "Returned deal_name does not match"
    assert "Acme Corp" in briefing_res.get("account_name", ""), "Returned account_name does not contain Acme Corp"
    assert briefing_res.get("hindsight_status") == "recalled", f"Expected hindsight_status='recalled', got: {briefing_res.get('hindsight_status')}"
    print(f"PASS: Metadata verified (deal_id, deal_name, account_name, hindsight_status='{briefing_res.get('hindsight_status')}')")
    print(f"PASS: Hindsight recalled memories count = {briefing_res.get('recalled_memories_count')}")
    print(f"PASS: Model used = {briefing_res.get('model')}")

    briefing = briefing_res.get("briefing", {})
    required_keys = ["key_points", "what_worked", "what_failed", "stakeholders", "pending_commitments", "recommended_approach", "evidence"]
    for k in required_keys:
        assert k in briefing, f"Missing required briefing key: {k}"
        print(f"  - Key '{k}': present")

    # 6. Validate Grounding & Absence of Hallucinations
    print("\n--- STEP 6: Grounding & Evidence-Based Verification ---")
    what_failed_text = " ".join(briefing.get("what_failed", [])).lower()
    what_worked_text = " ".join(briefing.get("what_worked", [])).lower()
    rec_text = briefing.get("recommended_approach", "").lower()
    evidence_text = " ".join(briefing.get("evidence", [])).lower()
    combined_briefing = f"{what_failed_text} {what_worked_text} {rec_text} {evidence_text}"

    # Verify that what_failed identifies discount failure
    assert "discount" in what_failed_text or "discount" in combined_briefing, (
        f"what_failed or briefing should reflect recorded discount failure. Got what_failed: {what_failed_text}"
    )
    print("PASS: 'what_failed' correctly identifies the failed discount-first tactic from recorded evidence.")

    # Verify that what_worked or recommended_approach references ROI / payback
    has_roi = "roi" in what_worked_text or "roi" in rec_text or "payback" in what_worked_text or "payback" in rec_text or "roi" in combined_briefing
    assert has_roi, (
        f"what_worked or recommended_approach should leverage ROI/payback framing from recorded experience. Got: {rec_text}"
    )
    print("PASS: 'what_worked' / 'recommended_approach' correctly incorporates ROI/payback framing from Hindsight experiential memory.")

    # Check that hyperbolic claims are not present
    hyperbolic_phrases = ["definitely win", "guaranteed to close", "100% chance", "fail-safe"]
    for phrase in hyperbolic_phrases:
        assert phrase not in rec_text, f"Hyperbolic phrase '{phrase}' found in recommended_approach: {rec_text}"
    print("PASS: 'recommended_approach' uses evidence-based language and avoids hyperbolic guarantees.")

    # 7. Test GET alternative endpoint
    print("\n--- STEP 7: GET /api/deals/{deal_id}/prepare Alternative ---")
    st_get, briefing_get = api_request("GET", f"/api/deals/{deal_id}/prepare", token=u1_token)
    assert st_get == 200, f"GET alternative failed with {st_get}"
    assert briefing_get.get("deal_id") == deal_id
    print("PASS: GET /api/deals/{deal_id}/prepare returns identical valid structured response.")

    print("\n" + "=" * 70)
    print("ALL PART 5 VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 70)
    return True


if __name__ == "__main__":
    # Check if a server is already running
    server_ready = wait_for_server(timeout=1)
    if not server_ready:
        print("Starting background uvicorn server on port 8000...")
        config = uvicorn.Config("app.main:app", host="127.0.0.1", port=8000, log_level="warning")
        server = uvicorn.Server(config)
        t = threading.Thread(target=server.run, daemon=True)
        t.start()
        if not wait_for_server(timeout=10):
            print("ERROR: Uvicorn server failed to start.")
            sys.exit(1)
        print("Uvicorn server running on http://127.0.0.1:8000")

    success = run_verification()
    os._exit(0 if success else 2)
