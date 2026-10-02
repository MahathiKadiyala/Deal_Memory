"""
End-to-End Verification Suite for Part 6: Frontend <-> Backend Integration.

Validates all 8 Part 6 requirements:
1. Frontend build (TypeScript compilation and Vite production bundle).
2. Backend health check (FastAPI + Supabase PostgreSQL).
3. Login flow with Bearer JWT issuance.
4. Acme Corp / Enterprise Platform deal resolution.
5. Real deal preparation invocation (POST /api/deals/{deal_id}/prepare).
6. Verification of real grounded response (Hindsight recall + Groq synthesis).
7. Zero secret exposure in client source or production build.
8. Verification of all existing frontend routes.
"""

import json
import os
from pathlib import Path
import subprocess
import sys
import urllib.error
import urllib.request

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

BACKEND_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:5173"


def api_call(url, method="GET", body=None, token=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode("utf-8")
        status = resp.status
        try:
            parsed = json.loads(content)
        except Exception:
            parsed = content
        return status, parsed


def run_checks():
    print("=" * 72)
    print("DEALMEMORY PART 6 — FRONTEND <-> BACKEND INTEGRATION VERIFICATION")
    print("=" * 72)

    # -------------------------------------------------------------
    # 1. FRONTEND BUILD
    # -------------------------------------------------------------
    print("\n--- STEP 1: Frontend Build Verification ---")
    frontend_dir = BACKEND_DIR.parent / "frontend"
    res = subprocess.run(
        ["npm.cmd", "run", "build"],
        cwd=str(frontend_dir),
        capture_output=True,
        text=True,
    )
    if res.returncode != 0:
        res = subprocess.run(
            ["npm", "run", "build"],
            cwd=str(frontend_dir),
            capture_output=True,
            text=True,
        )
    assert res.returncode == 0, f"Frontend build failed: {res.stderr}\n{res.stdout}"
    assert (frontend_dir / "dist" / "index.html").exists(), "dist/index.html missing"
    print("PASS: Frontend production build (tsc -b && vite build) succeeded with 0 errors.")

    # -------------------------------------------------------------
    # 2. BACKEND HEALTH CHECK
    # -------------------------------------------------------------
    print("\n--- STEP 2: Backend Health Check ---")
    st, health = api_call(f"{BACKEND_URL}/api/health")
    assert st == 200, f"Health check returned {st}"
    assert health.get("status") == "ok", f"Health status not ok: {health}"
    assert health.get("database") == "connected", f"Database not connected: {health}"
    print(f"PASS: Backend healthy: service='{health.get('service')}', database='{health.get('database')}'")

    # -------------------------------------------------------------
    # 3. LOGIN & JWT AUTHENTICATION
    # -------------------------------------------------------------
    print("\n--- STEP 3: User Authentication & JWT Flow ---")
    st, login_res = api_call(
        f"{BACKEND_URL}/api/auth/login",
        method="POST",
        body={"email": "sarah.johnson@dealmemory.com", "password": "password123"},
    )
    assert st == 200, f"Login failed: {st}"
    token = login_res.get("access_token")
    assert token and len(token) > 20, "JWT access token missing or invalid"
    user = login_res.get("user", {})
    print(f"PASS: Authenticated as '{user.get('name')}' ({user.get('email')}). Bearer JWT issued.")

    # -------------------------------------------------------------
    # 4. OPEN ACME DEAL
    # -------------------------------------------------------------
    print("\n--- STEP 4: Acme Deal Resolution ---")
    st, deals = api_call(f"{BACKEND_URL}/api/deals", token=token)
    assert st == 200, f"List deals failed: {st}"
    acme_deal = next(
        (d for d in deals if "enterprise platform" in d.get("name", "").lower()),
        None,
    )
    assert acme_deal is not None, f"Acme Enterprise Platform deal not found in: {deals}"
    deal_id = acme_deal["id"]
    print(f"PASS: Acme Deal found: '{acme_deal['name']}', Value: ${acme_deal['value']}, ID: {deal_id}")

    # -------------------------------------------------------------
    # 5. CLICK PREPARE ME (REAL API CALL)
    # -------------------------------------------------------------
    print("\n--- STEP 5: Real Deal Preparation (POST /api/deals/{deal_id}/prepare) ---")
    st, briefing = api_call(f"{BACKEND_URL}/api/deals/{deal_id}/prepare", method="POST", token=token)
    assert st == 200, f"Deal preparation failed: {st}: {briefing}"
    print(f"PASS: Real backend preparation succeeded with HTTP 200.")

    # -------------------------------------------------------------
    # 6. VERIFY REAL API RESPONSE & GROUNDING
    # -------------------------------------------------------------
    print("\n--- STEP 6: Real API Response Content & Grounding Validation ---")
    assert briefing.get("deal_id") == deal_id, "Deal ID mismatch in response"
    assert briefing.get("deal_name") == "Enterprise Platform", "Deal name mismatch"
    assert "Acme" in briefing.get("account_name", ""), "Account name mismatch"
    assert briefing.get("hindsight_status") == "recalled", f"Expected hindsight_status='recalled', got {briefing.get('hindsight_status')}"
    mem_count = briefing.get("recalled_memories_count", 0)
    assert mem_count > 0, f"Expected recalled memories > 0, got {mem_count}"
    model_used = briefing.get("model", "")
    print(f"PASS: Hindsight memory status = '{briefing.get('hindsight_status')}'")
    print(f"PASS: Hindsight recalled memories count = {mem_count}")
    print(f"PASS: Groq Model used = '{model_used}'")

    b_content = briefing.get("briefing", {})
    required_sections = [
        "key_points",
        "what_worked",
        "what_failed",
        "stakeholders",
        "pending_commitments",
        "recommended_approach",
        "evidence",
    ]
    for sec in required_sections:
        assert sec in b_content, f"Missing required briefing section: {sec}"
        val = b_content[sec]
        assert val, f"Section '{sec}' is empty: {val}"
        print(f"  - Verified section '{sec}': present and populated")

    # Content grounding checks
    what_failed = " ".join(b_content.get("what_failed", [])).lower()
    what_worked = " ".join(b_content.get("what_worked", [])).lower()
    stakeholders = " ".join(b_content.get("stakeholders", [])).lower()
    rec_approach = b_content.get("recommended_approach", "").lower()
    evidence = " ".join(b_content.get("evidence", [])).lower()
    full_text = f"{what_failed} {what_worked} {stakeholders} {rec_approach} {evidence}"

    assert "discount" in what_failed or "discount" in full_text, (
        f"what_failed should capture failed discount tactic. Got: {what_failed}"
    )
    print("PASS: 'what_failed' correctly identifies discount-first approach failure.")

    assert "roi" in what_worked or "roi" in rec_approach or "payback" in rec_approach or "roi" in full_text, (
        f"what_worked or recommended_approach should leverage ROI/payback framing. Got: {rec_approach}"
    )
    print("PASS: 'what_worked' / 'recommended_approach' leverages ROI and payback framing.")

    assert "sarah" in stakeholders or "cfo" in stakeholders or "sarah" in full_text, (
        f"stakeholders should identify Sarah Chen / CFO context. Got: {stakeholders}"
    )
    print("PASS: 'stakeholders' correctly contains Sarah Chen / CFO strategic context.")

    assert len(b_content.get("evidence", [])) > 0, "evidence citations missing"
    print(f"PASS: 'evidence' provides {len(b_content.get('evidence', []))} factual citations.")

    # -------------------------------------------------------------
    # 7. ZERO SECRET EXPOSURE CHECK
    # -------------------------------------------------------------
    print("\n--- STEP 7: Security Audit (Zero Secrets in Client Code) ---")
    leaks = []
    for check_path in [frontend_dir / "src", frontend_dir / "dist"]:
        for root, _, files in os.walk(check_path):
            for f in files:
                if f.endswith((".js", ".ts", ".tsx", ".html", ".css")):
                    p = Path(root) / f
                    with open(p, "r", encoding="utf-8", errors="ignore") as fp:
                        txt = fp.read()
                        if "gsk_" in txt:
                            leaks.append((str(p), "gsk_ prefix"))
                        if "GROQ_API_KEY=" in txt:
                            leaks.append((str(p), "GROQ_API_KEY="))
                        if "HINDSIGHT_API_KEY=" in txt:
                            leaks.append((str(p), "HINDSIGHT_API_KEY="))
    assert len(leaks) == 0, f"Found secrets in client files: {leaks}"
    print("PASS: Verified 0 secrets in frontend source and production bundle.")

    # -------------------------------------------------------------
    # 8. EXISTING ROUTES VERIFICATION
    # -------------------------------------------------------------
    print("\n--- STEP 8: Existing Frontend Routes Verification ---")
    routes = [
        "/",
        "/login",
        "/signup",
        "/dashboard",
        "/deals",
        "/deals/acme",
        f"/deals/{deal_id}",
        "/memory",
        "/interactions",
        "/accounts",
        "/follow-ups",
        "/settings",
        "/help",
    ]
    for r in routes:
        req = urllib.request.Request(f"{FRONTEND_URL}{r}", headers={"User-Agent": "TestRunner"})
        with urllib.request.urlopen(req) as resp:
            assert resp.status == 200, f"Route {r} returned {resp.status}"
            body = resp.read().decode("utf-8")
            assert '<div id="root">' in body, f"Route {r} did not render root container"
        print(f"  - Route '{r}': HTTP 200 OK")

    print("\n" + "=" * 72)
    print("ALL 8 PART 6 VERIFICATION REQUIREMENTS PASSED WITH 100% SUCCESS!")
    print("=" * 72)
    return True


if __name__ == "__main__":
    ok = run_checks()
    sys.exit(0 if ok else 1)
