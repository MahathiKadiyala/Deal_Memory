import uuid
import httpx
import sys
import os

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from app.core.database import SessionLocal
from app.models.user import User
from app.models.stakeholder import Stakeholder
from app.models.account import Account
from app.models.deal import Deal

BASE_URL = "http://127.0.0.1:8000"

def test_full_auth_and_isolation():
    client = httpx.Client(base_url=BASE_URL, timeout=30.0)
    results = {}
    print("=" * 60)
    print("RUNNING AUTHENTICATION & DEMO-DATA BEHAVIOR VERIFICATION")
    print("=" * 60)

    # 1. Verify Sarah Chen in DB: stakeholder only, NOT a user
    db = SessionLocal()
    try:
        user_sarah_chen = db.execute(select(User).where(User.email.ilike("%sarah.chen%"))).scalar_one_or_none()
        stakeholder_sarah_chen = db.execute(select(Stakeholder).where(Stakeholder.email == "sarah.chen@acmecorp.com")).first()
        
        print(f"\n[Check 1] Sarah Chen in users table: {user_sarah_chen is not None} (Expected: False)")
        print(f"[Check 1] Sarah Chen in stakeholders table: {stakeholder_sarah_chen is not None} (Expected: True)")
        
        if not user_sarah_chen and stakeholder_sarah_chen:
            results["Sarah correctly treated as stakeholder"] = True
            print(">>> PASS: Sarah Chen is strictly a stakeholder, NOT a login user.")
        else:
            results["Sarah correctly treated as stakeholder"] = False
            print(">>> FAIL: Sarah Chen database role check failed.")
    finally:
        db.close()

    # 2. Verify Sarah Chen cannot log in via backend /api/auth/login
    sarah_chen_login = client.post("/api/auth/login", json={
        "email": "sarah.chen@acmecorp.com",
        "password": "anypassword123"
    })
    print(f"\n[Check 2] Sarah Chen login attempt HTTP {sarah_chen_login.status_code}")
    assert sarah_chen_login.status_code == 401, f"Expected 401 Unauthorized for Sarah Chen, got {sarah_chen_login.status_code}"
    print(">>> PASS: Sarah Chen login blocked with 401 Unauthorized.")

    # 3. Test User A Signup
    uid_a = uuid.uuid4().hex[:8]
    user_a_email = f"user_a_{uid_a}@example.com"
    user_a_pwd = "Password123!"
    user_a_name = f"User Alpha {uid_a}"

    res_signup_a = client.post("/api/auth/signup", json={
        "name": user_a_name,
        "email": user_a_email,
        "password": user_a_pwd
    })
    print(f"\n[Check 3] User A signup ({user_a_email}): HTTP {res_signup_a.status_code}")
    if res_signup_a.status_code == 201 and "access_token" in res_signup_a.json():
        results["Signup User A"] = True
        print(f">>> PASS: User A signed up successfully. Token length: {len(res_signup_a.json()['access_token'])}")
    else:
        results["Signup User A"] = False
        print(f">>> FAIL: User A signup failed: {res_signup_a.text}")

    # 4. Test User A Login
    res_login_a = client.post("/api/auth/login", json={
        "email": user_a_email,
        "password": user_a_pwd
    })
    print(f"\n[Check 4] User A login: HTTP {res_login_a.status_code}")
    if res_login_a.status_code == 200 and "access_token" in res_login_a.json():
        results["Login User A"] = True
        token_a = res_login_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}
        print(f">>> PASS: User A logged in successfully.")
    else:
        results["Login User A"] = False
        print(f">>> FAIL: User A login failed: {res_login_a.text}")
        token_a = None

    # 5. Verify User A initial data is empty (no auto-exposure of demo data)
    res_a_accounts = client.get("/api/accounts", headers=headers_a)
    res_a_deals = client.get("/api/deals", headers=headers_a)
    print(f"\n[Check 5] User A initial accounts: {len(res_a_accounts.json())}, initial deals: {len(res_a_deals.json())}")
    assert len(res_a_accounts.json()) == 0, "User A should start with an empty workspace"
    assert len(res_a_deals.json()) == 0, "User A should start with an empty workspace"
    print(">>> PASS: New user starts with empty personal workspace.")

    # 6. User A creates an Account and a Deal
    res_create_account_a = client.post("/api/accounts", headers=headers_a, json={
        "name": f"Alpha Enterprise {uid_a}",
        "industry": "FinTech",
        "primary_contact": "Alex Alpha",
        "contact_email": f"alex@{uid_a}.com",
        "notes": "Confidential alpha data"
    })
    assert res_create_account_a.status_code == 201, f"Failed to create User A account: {res_create_account_a.text}"
    account_a_id = res_create_account_a.json()["id"]

    res_create_deal_a = client.post("/api/deals", headers=headers_a, json={
        "account_id": account_a_id,
        "name": f"Alpha Security Suite {uid_a}",
        "value": 150000,
        "stage": "Negotiation",
        "health": "Healthy",
        "main_objection": "Security audit pending",
        "next_action": "Deliver SOC2 report"
    })
    assert res_create_deal_a.status_code == 201, f"Failed to create User A deal: {res_create_deal_a.text}"
    deal_a_id = res_create_deal_a.json()["id"]
    print(f">>> User A created account {account_a_id} and deal {deal_a_id}")

    # 7. Test User B Signup
    uid_b = uuid.uuid4().hex[:8]
    user_b_email = f"user_b_{uid_b}@example.com"
    user_b_pwd = "Password456!"
    user_b_name = f"User Beta {uid_b}"

    res_signup_b = client.post("/api/auth/signup", json={
        "name": user_b_name,
        "email": user_b_email,
        "password": user_b_pwd
    })
    print(f"\n[Check 7] User B signup ({user_b_email}): HTTP {res_signup_b.status_code}")
    if res_signup_b.status_code == 201 and "access_token" in res_signup_b.json():
        results["Signup User B"] = True
        print(f">>> PASS: User B signed up successfully.")
    else:
        results["Signup User B"] = False
        print(f">>> FAIL: User B signup failed: {res_signup_b.text}")

    # 8. Test User B Login
    res_login_b = client.post("/api/auth/login", json={
        "email": user_b_email,
        "password": user_b_pwd
    })
    print(f"\n[Check 8] User B login: HTTP {res_login_b.status_code}")
    if res_login_b.status_code == 200 and "access_token" in res_login_b.json():
        results["Login User B"] = True
        token_b = res_login_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}
        print(f">>> PASS: User B logged in successfully.")
    else:
        results["Login User B"] = False
        print(f">>> FAIL: User B login failed: {res_login_b.text}")
        token_b = None

    # 9. Verify User Isolation: User B cannot see User A's data
    res_b_accounts = client.get("/api/accounts", headers=headers_b)
    res_b_deals = client.get("/api/deals", headers=headers_b)
    
    b_account_ids = [acc["id"] for acc in res_b_accounts.json()]
    b_deal_ids = [d["id"] for d in res_b_deals.json()]

    isolation_passed = True
    if account_a_id in b_account_ids or deal_a_id in b_deal_ids:
        isolation_passed = False
        print(">>> FAIL: User B can see User A's accounts or deals in list!")

    # User B direct access attempts to User A's resources
    res_b_get_acc_a = client.get(f"/api/accounts/{account_a_id}", headers=headers_b)
    res_b_get_deal_a = client.get(f"/api/deals/{deal_a_id}", headers=headers_b)
    res_b_prepare_deal_a = client.post(f"/api/deals/{deal_a_id}/prepare", headers=headers_b)

    print(f"\n[Check 9] User B GET User A's account: HTTP {res_b_get_acc_a.status_code} (Expected 404)")
    print(f"[Check 9] User B GET User A's deal: HTTP {res_b_get_deal_a.status_code} (Expected 404)")
    print(f"[Check 9] User B POST User A's deal prepare: HTTP {res_b_prepare_deal_a.status_code} (Expected 404)")

    if (res_b_get_acc_a.status_code != 404 or 
        res_b_get_deal_a.status_code != 404 or 
        res_b_prepare_deal_a.status_code != 404):
        isolation_passed = False

    if isolation_passed:
        results["User isolation"] = True
        print(">>> PASS: Strict server-side user isolation confirmed.")
    else:
        results["User isolation"] = False
        print(">>> FAIL: User isolation check failed.")

    # 10. Verify Acme Demo Data ownership
    acme_deal_id = "00278405-0156-4732-b72c-7c44c847ada4"
    res_b_get_acme = client.get(f"/api/deals/{acme_deal_id}", headers=headers_b)
    res_b_prepare_acme = client.post(f"/api/deals/{acme_deal_id}/prepare", headers=headers_b)
    print(f"\n[Check 10] User B GET Acme deal: HTTP {res_b_get_acme.status_code} (Expected 404)")
    print(f"[Check 10] User B POST Acme deal prepare: HTTP {res_b_prepare_acme.status_code} (Expected 404)")

    # Login as demo user Sarah Johnson
    demo_login = client.post("/api/auth/login", json={
        "email": "sarah.johnson@dealmemory.com",
        "password": "password123"
    })
    print(f"\n[Check 11] Demo user Sarah Johnson login: HTTP {demo_login.status_code}")
    demo_token = demo_login.json().get("access_token")
    demo_headers = {"Authorization": f"Bearer {demo_token}"}

    res_demo_get_acme = client.get(f"/api/deals/{acme_deal_id}", headers=demo_headers)
    print(f"[Check 11] Demo user GET Acme deal: HTTP {res_demo_get_acme.status_code}")

    if (res_b_get_acme.status_code == 404 and 
        res_b_prepare_acme.status_code == 404 and 
        res_demo_get_acme.status_code == 200):
        results["Acme demo ownership"] = True
        print(">>> PASS: Acme demo data is strictly owned by demo user Sarah Johnson.")
    else:
        results["Acme demo ownership"] = False
        print(">>> FAIL: Acme demo ownership check failed.")

    print("\n" + "=" * 60)
    print("FINAL SUMMARY REPORT:")
    print("=" * 60)
    for key in [
        "Signup User A",
        "Login User A",
        "Signup User B",
        "Login User B",
        "User isolation",
        "Sarah correctly treated as stakeholder",
        "Acme demo ownership"
    ]:
        val = results.get(key, False)
        status = "✅" if val else "❌"
        print(f"- {key} {status}")
    print("=" * 60)

if __name__ == "__main__":
    test_full_auth_and_isolation()
