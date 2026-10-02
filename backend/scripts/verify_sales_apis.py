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


def run_tests():
    print("=" * 60)
    print("STARTING DEALMEMORY SALES API VERIFICATION SUITE")
    print("=" * 60)

    # 1. Health Endpoint Verification
    print("\n--- TEST 1: Health Check ---")
    status_code, body = api_request("GET", "/api/health")
    assert status_code == 200, f"Health check failed with {status_code}: {body}"
    assert body.get("database") == "connected", f"Database not connected: {body}"
    assert body.get("status") == "ok", f"Health status not ok: {body}"
    print(f"PASS: /api/health returned 200 with database='{body.get('database')}'")

    # 2. Unauthenticated Requests Return 401
    print("\n--- TEST 2: Unauthenticated Requests Return 401 ---")
    protected_endpoints = [
        ("GET", "/api/accounts"),
        ("POST", "/api/accounts"),
        ("GET", "/api/deals"),
        ("POST", "/api/deals"),
        ("GET", "/api/stakeholders"),
        ("POST", "/api/stakeholders"),
        ("GET", "/api/interactions"),
        ("POST", "/api/interactions"),
        ("GET", "/api/follow-ups"),
        ("POST", "/api/follow-ups"),
        ("GET", "/api/auth/me"),
    ]
    for m, ep in protected_endpoints:
        st, b = api_request(m, ep, body={} if m == "POST" else None, token=None)
        assert st == 401, f"Expected 401 for unauthenticated {m} {ep}, got {st}: {b}"
    print(f"PASS: All {len(protected_endpoints)} protected endpoints rejected unauthenticated calls with 401.")

    # 3. Create Test User 1
    print("\n--- TEST 3: User 1 Signup & Authentication ---")
    u1_suffix = str(uuid.uuid4())[:8]
    u1_email = f"sales_rep_1_{u1_suffix}@example.com"
    signup_body = {
        "email": u1_email,
        "password": "SecurePassword123!",
        "name": f"Sales Rep One {u1_suffix}",
    }
    st, u1_res = api_request("POST", "/api/auth/signup", body=signup_body)
    assert st == 201, f"User 1 signup failed with {st}: {u1_res}"
    u1_token = u1_res["access_token"]
    u1_id = u1_res["user"]["id"]
    print(f"PASS: User 1 created with email [MASKED] and ID {u1_id}")

    # Verify /api/auth/me
    st, me_res = api_request("GET", "/api/auth/me", token=u1_token)
    assert st == 200, f"/api/auth/me failed with {st}: {me_res}"
    assert me_res["id"] == u1_id
    print("PASS: User 1 /api/auth/me succeeded")

    # 4. User 1: Account Creation & Listing
    print("\n--- TEST 4: Account Creation & Listing ---")
    acc_payload = {
        "name": f"Acme Corporation {u1_suffix}",
        "industry": "Enterprise Software",
        "primary_contact": "Alice Smith",
        "contact_email": f"alice@{u1_suffix}.acme.com",
        "notes": "Key prospect for Q3 expansion",
    }
    st, acc1 = api_request("POST", "/api/accounts", body=acc_payload, token=u1_token)
    assert st == 201, f"Create account failed with {st}: {acc1}"
    acc1_id = acc1["id"]
    assert acc1["name"] == acc_payload["name"]
    assert acc1["owner_user_id"] == u1_id, "Account owner_user_id did not match authenticated user"
    print(f"PASS: Account created with ID {acc1_id}, owned by User 1")

    # List accounts
    st, acc_list = api_request("GET", "/api/accounts", token=u1_token)
    assert st == 200, f"List accounts failed with {st}: {acc_list}"
    assert any(a["id"] == acc1_id for a in acc_list), "Created account not found in list"
    print(f"PASS: Account listing includes {acc1_id}")

    # Get single account
    st, acc_get = api_request("GET", f"/api/accounts/{acc1_id}", token=u1_token)
    assert st == 200, f"Get account failed with {st}: {acc_get}"
    assert acc_get["id"] == acc1_id
    print("PASS: Successfully retrieved account by ID")

    # Update account
    st, acc_up = api_request(
        "PUT",
        f"/api/accounts/{acc1_id}",
        body={"notes": "Updated strategy notes"},
        token=u1_token,
    )
    assert st == 200, f"Update account failed with {st}: {acc_up}"
    assert acc_up["notes"] == "Updated strategy notes"
    print("PASS: Account update succeeded")

    # 5. User 1: Deal Creation & Listing
    print("\n--- TEST 5: Deal Creation & Verification ---")
    deal_payload = {
        "account_id": acc1_id,
        "name": f"Acme Global Rollout {u1_suffix}",
        "value": 75000.00,
        "stage": "Discovery",
        "health": "Healthy",
        "main_objection": "Budget sign-off timeline",
        "next_action": "Schedule executive demo",
    }
    st, deal1 = api_request("POST", "/api/deals", body=deal_payload, token=u1_token)
    assert st == 201, f"Create deal failed with {st}: {deal1}"
    deal1_id = deal1["id"]
    assert deal1["account_id"] == acc1_id
    assert deal1["owner_user_id"] == u1_id, "Deal owner_user_id did not match authenticated user"
    assert deal1["last_interaction_at"] is None, "New deal should have null last_interaction_at"
    print(f"PASS: Deal created with ID {deal1_id}, owned by User 1")

    # List deals
    st, deal_list = api_request("GET", "/api/deals", token=u1_token)
    assert st == 200, f"List deals failed with {st}: {deal_list}"
    assert any(d["id"] == deal1_id for d in deal_list)
    print(f"PASS: Deal listing includes {deal1_id}")

    # Get deal by ID
    st, deal_get = api_request("GET", f"/api/deals/{deal1_id}", token=u1_token)
    assert st == 200, f"Get deal failed with {st}: {deal_get}"
    assert deal_get["id"] == deal1_id
    print("PASS: Successfully retrieved deal by ID")

    # Update deal
    st, deal_up = api_request(
        "PUT",
        f"/api/deals/{deal1_id}",
        body={"stage": "Proposal", "value": 85000.00},
        token=u1_token,
    )
    assert st == 200, f"Update deal failed with {st}: {deal_up}"
    assert deal_up["stage"] == "Proposal"
    print("PASS: Deal update succeeded")

    # 6. User 1: Stakeholder Creation
    print("\n--- TEST 6: Stakeholder Creation & Retrieval ---")
    stk_payload = {
        "account_id": acc1_id,
        "name": "Bob Vance",
        "role": "VP of Engineering",
        "email": f"bob@{u1_suffix}.acme.com",
    }
    st, stk1 = api_request("POST", "/api/stakeholders", body=stk_payload, token=u1_token)
    assert st == 201, f"Create stakeholder failed with {st}: {stk1}"
    stk1_id = stk1["id"]
    assert stk1["account_id"] == acc1_id
    print(f"PASS: Stakeholder created with ID {stk1_id}")

    # Get deal stakeholders
    st, deal_stks = api_request("GET", f"/api/deals/{deal1_id}/stakeholders", token=u1_token)
    assert st == 200, f"Get deal stakeholders failed with {st}: {deal_stks}"
    assert any(s["id"] == stk1_id for s in deal_stks)
    print(f"PASS: /api/deals/{deal1_id}/stakeholders returned stakeholder {stk1_id}")

    # Update stakeholder
    st, stk_up = api_request(
        "PUT",
        f"/api/stakeholders/{stk1_id}",
        body={"role": "Chief Technology Officer"},
        token=u1_token,
    )
    assert st == 200, f"Update stakeholder failed with {st}: {stk_up}"
    assert stk_up["role"] == "Chief Technology Officer"
    print("PASS: Stakeholder update succeeded")

    # 7. User 1: Interaction Creation & Deal last_interaction_at Update
    print("\n--- TEST 7: Interaction Creation & deal.last_interaction_at Auto-Update ---")
    interaction_time = "2026-09-27T10:30:00Z"
    int_payload = {
        "deal_id": deal1_id,
        "account_id": acc1_id,
        "stakeholder_id": stk1_id,
        "interaction_type": "Product Demo",
        "interaction_date": interaction_time,
        "concern": "Cloud hosting security compliance",
        "approach": "Demonstrated SOC2 Type II compliance and isolated tenant architecture",
        "outcome": "Positive",
        "notes": "Client requested proposal by Tuesday",
    }
    st, int1 = api_request("POST", "/api/interactions", body=int_payload, token=u1_token)
    assert st == 201, f"Create interaction failed with {st}: {int1}"
    int1_id = int1["id"]
    assert int1["deal_id"] == deal1_id
    assert int1["account_id"] == acc1_id
    assert int1["stakeholder_id"] == stk1_id
    print(f"PASS: Interaction created with ID {int1_id}")

    # Verify deal.last_interaction_at was updated!
    st, deal_after_int = api_request("GET", f"/api/deals/{deal1_id}", token=u1_token)
    assert st == 200, f"Get deal failed with {st}: {deal_after_int}"
    assert deal_after_int["last_interaction_at"] is not None, "deal.last_interaction_at was not updated!"
    print(f"PASS: deal.last_interaction_at was successfully updated to: {deal_after_int['last_interaction_at']}")

    # Get deal interactions
    st, deal_ints = api_request("GET", f"/api/deals/{deal1_id}/interactions", token=u1_token)
    assert st == 200, f"Get deal interactions failed with {st}: {deal_ints}"
    assert any(i["id"] == int1_id for i in deal_ints)
    print(f"PASS: /api/deals/{deal1_id}/interactions returned interaction {int1_id}")

    # 8. User 1: Follow-up Creation & Retrieval
    print("\n--- TEST 8: Follow-up Creation & Retrieval ---")
    fu_payload = {
        "deal_id": deal1_id,
        "account_id": acc1_id,
        "stakeholder_id": stk1_id,
        "title": "Send updated commercial proposal with multi-year tier",
        "due_at": "2026-09-30T17:00:00Z",
        "priority": "High",
        "status": "Pending",
        "notes": "Include 15% discount for 3-year term",
    }
    st, fu1 = api_request("POST", "/api/follow-ups", body=fu_payload, token=u1_token)
    assert st == 201, f"Create follow-up failed with {st}: {fu1}"
    fu1_id = fu1["id"]
    assert fu1["deal_id"] == deal1_id
    assert fu1["account_id"] == acc1_id
    assert fu1["title"] == fu_payload["title"]
    print(f"PASS: Follow-up created with ID {fu1_id}")

    # List follow-ups
    st, fu_list = api_request("GET", "/api/follow-ups", token=u1_token)
    assert st == 200, f"List follow-ups failed with {st}: {fu_list}"
    assert any(f["id"] == fu1_id for f in fu_list)
    print(f"PASS: Follow-ups list includes {fu1_id}")

    # Update follow-up
    st, fu_up = api_request(
        "PUT",
        f"/api/follow-ups/{fu1_id}",
        body={"status": "Completed"},
        token=u1_token,
    )
    assert st == 200, f"Update follow-up failed with {st}: {fu_up}"
    assert fu_up["status"] == "Completed"
    print("PASS: Follow-up update succeeded")

    # 9. User 2 Creation & Multi-Tenant User Isolation Testing
    print("\n--- TEST 9: Create User 2 & Verify Complete User Isolation ---")
    u2_suffix = str(uuid.uuid4())[:8]
    u2_email = f"sales_rep_2_{u2_suffix}@example.com"
    signup_body2 = {
        "email": u2_email,
        "password": "SecurePassword123!",
        "name": f"Sales Rep Two {u2_suffix}",
    }
    st, u2_res = api_request("POST", "/api/auth/signup", body=signup_body2)
    assert st == 201, f"User 2 signup failed with {st}: {u2_res}"
    u2_token = u2_res["access_token"]
    u2_id = u2_res["user"]["id"]
    print(f"PASS: User 2 created with ID {u2_id}")

    # 10. Verify User 2 cannot list User 1's resources
    print("\n--- TEST 10: User 2 List Isolation ---")
    st, u2_accounts = api_request("GET", "/api/accounts", token=u2_token)
    assert st == 200 and len(u2_accounts) == 0, f"User 2 saw accounts: {u2_accounts}"

    st, u2_deals = api_request("GET", "/api/deals", token=u2_token)
    assert st == 200 and len(u2_deals) == 0, f"User 2 saw deals: {u2_deals}"

    st, u2_stks = api_request("GET", "/api/stakeholders", token=u2_token)
    assert st == 200 and len(u2_stks) == 0, f"User 2 saw stakeholders: {u2_stks}"

    st, u2_ints = api_request("GET", "/api/interactions", token=u2_token)
    assert st == 200 and len(u2_ints) == 0, f"User 2 saw interactions: {u2_ints}"

    st, u2_fus = api_request("GET", "/api/follow-ups", token=u2_token)
    assert st == 200 and len(u2_fus) == 0, f"User 2 saw follow-ups: {u2_fus}"
    print("PASS: User 2 cannot see any of User 1's accounts, deals, stakeholders, interactions, or follow-ups in lists.")

    # 11. Verify User 2 cross-user access returns 404 (NOT 403 or leaking existence)
    print("\n--- TEST 11: Cross-User Direct Access Returns 404 (No Information Leakage) ---")
    cross_access_cases = [
        # Accounts
        ("GET", f"/api/accounts/{acc1_id}", None),
        ("PUT", f"/api/accounts/{acc1_id}", {"name": "Hacked"}),
        ("DELETE", f"/api/accounts/{acc1_id}", None),
        # Deals
        ("GET", f"/api/deals/{deal1_id}", None),
        ("PUT", f"/api/deals/{deal1_id}", {"name": "Hacked"}),
        ("DELETE", f"/api/deals/{deal1_id}", None),
        ("GET", f"/api/deals/{deal1_id}/stakeholders", None),
        ("GET", f"/api/deals/{deal1_id}/interactions", None),
        # Stakeholders
        ("GET", f"/api/stakeholders/{stk1_id}", None),
        ("PUT", f"/api/stakeholders/{stk1_id}", {"name": "Hacked"}),
        ("DELETE", f"/api/stakeholders/{stk1_id}", None),
        # Interactions
        ("GET", f"/api/interactions/{int1_id}", None),
        ("PUT", f"/api/interactions/{int1_id}", {"concern": "Hacked"}),
        ("DELETE", f"/api/interactions/{int1_id}", None),
        # Follow-ups
        ("GET", f"/api/follow-ups/{fu1_id}", None),
        ("PUT", f"/api/follow-ups/{fu1_id}", {"title": "Hacked"}),
        ("DELETE", f"/api/follow-ups/{fu1_id}", None),
    ]

    for m, ep, b in cross_access_cases:
        st, res = api_request(m, ep, body=b, token=u2_token)
        assert st == 404, f"Expected 404 for User 2 accessing {m} {ep}, but got {st}: {res}"
    print(f"PASS: All {len(cross_access_cases)} cross-user access attempts correctly returned HTTP 404 Not Found.")

    # 12. Verify User 2 cannot forge child resources pointing to User 1's resources
    print("\n--- TEST 12: Cross-User Resource Creation Forbidden (Returns 404) ---")
    st, res = api_request(
        "POST",
        "/api/deals",
        body={"account_id": acc1_id, "name": "Forged Deal"},
        token=u2_token,
    )
    assert st == 404, f"User 2 should not create deal on User 1 account, got {st}: {res}"

    st, res = api_request(
        "POST",
        "/api/stakeholders",
        body={"account_id": acc1_id, "name": "Forged Stakeholder"},
        token=u2_token,
    )
    assert st == 404, f"User 2 should not create stakeholder on User 1 account, got {st}: {res}"

    st, res = api_request(
        "POST",
        "/api/interactions",
        body={"deal_id": deal1_id, "account_id": acc1_id, "interaction_type": "Call"},
        token=u2_token,
    )
    assert st == 404, f"User 2 should not create interaction on User 1 deal, got {st}: {res}"

    st, res = api_request(
        "POST",
        "/api/follow-ups",
        body={"deal_id": deal1_id, "account_id": acc1_id, "title": "Forged Followup"},
        token=u2_token,
    )
    assert st == 404, f"User 2 should not create follow-up on User 1 deal, got {st}: {res}"
    print("PASS: Cross-user resource creation attempts correctly returned 404 Not Found.")

    # 13. Verify Delete Operations & Cleanup for User 1
    print("\n--- TEST 13: Delete Operations & Post-Delete 404 Verification ---")
    st, _ = api_request("DELETE", f"/api/follow-ups/{fu1_id}", token=u1_token)
    assert st == 204, f"Delete follow-up failed: {st}"
    st, _ = api_request("GET", f"/api/follow-ups/{fu1_id}", token=u1_token)
    assert st == 404, "Deleted follow-up still accessible"

    st, _ = api_request("DELETE", f"/api/interactions/{int1_id}", token=u1_token)
    assert st == 204, f"Delete interaction failed: {st}"
    st, _ = api_request("GET", f"/api/interactions/{int1_id}", token=u1_token)
    assert st == 404, "Deleted interaction still accessible"

    st, _ = api_request("DELETE", f"/api/stakeholders/{stk1_id}", token=u1_token)
    assert st == 204, f"Delete stakeholder failed: {st}"
    st, _ = api_request("GET", f"/api/stakeholders/{stk1_id}", token=u1_token)
    assert st == 404, "Deleted stakeholder still accessible"

    st, _ = api_request("DELETE", f"/api/deals/{deal1_id}", token=u1_token)
    assert st == 204, f"Delete deal failed: {st}"
    st, _ = api_request("GET", f"/api/deals/{deal1_id}", token=u1_token)
    assert st == 404, "Deleted deal still accessible"

    st, _ = api_request("DELETE", f"/api/accounts/{acc1_id}", token=u1_token)
    assert st == 204, f"Delete account failed: {st}"
    st, _ = api_request("GET", f"/api/accounts/{acc1_id}", token=u1_token)
    assert st == 404, "Deleted account still accessible"
    print("PASS: All resources successfully deleted and confirmed returning 404.")

    # 14. Authentication endpoints (Login & Logout)
    print("\n--- TEST 14: Authentication Endpoints (Login & Logout) ---")
    login_body = {"email": u1_email, "password": "SecurePassword123!"}
    st, login_res = api_request("POST", "/api/auth/login", body=login_body)
    assert st == 200, f"Login failed with {st}: {login_res}"
    assert "access_token" in login_res, "Login response missing access_token"

    st, logout_res = api_request("POST", "/api/auth/logout", token=u1_token)
    assert st == 200, f"Logout failed with {st}: {logout_res}"
    print("PASS: Login and Logout endpoints verified successfully.")

    # 15. Final Health Check
    print("\n--- TEST 15: Final Health Check ---")
    st, h = api_request("GET", "/api/health")
    assert st == 200 and h.get("database") == "connected"
    print("PASS: /api/health returns 200 with database='connected'.")

    print("\n" + "=" * 60)
    print("ALL 15 TESTS PASSED SUCCESSFULLY! FULL ISOLATION VERIFIED.")
    print("=" * 60)


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
        run_tests()
    finally:
        server.should_exit = True
        thread.join(timeout=2)


if __name__ == "__main__":
    start_server_and_test()
