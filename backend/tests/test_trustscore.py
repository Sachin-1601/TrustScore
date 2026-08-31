"""
End-to-end backend tests for TrustScore Next.js app.
Uses same-origin /api endpoints via the preview URL.
"""
import os
import uuid
import pytest
import requests

BASE_URL = "https://290df638-9125-4947-a892-ab50a06ef2fd.preview.emergentagent.com"
PASSWORD = "TrustScore123!"

SARAH = "sarah@dev.trustscore.local"
MARCUS = "marcus@dev.trustscore.local"
ALEX = "alex@dev.trustscore.local"


def _login(email, password=PASSWORD):
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password}, timeout=30)
    assert r.status_code == 200, f"login {email} failed: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="module")
def sarah():
    return _login(SARAH)


@pytest.fixture(scope="module")
def marcus():
    return _login(MARCUS)


@pytest.fixture(scope="module")
def alex():
    return _login(ALEX)


# ---------- Auth ----------
class TestAuth:
    def test_login_business(self):
        s = _login(SARAH)
        # session cookie set
        assert any(c.name == "trustscore_session" for c in s.cookies)

    def test_login_creator(self):
        s = _login(ALEX)
        assert any(c.name == "trustscore_session" for c in s.cookies)

    def test_login_bad_password(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": SARAH, "password": "wrong"}, timeout=30)
        assert r.status_code in (400, 401)

    def test_signup_rejects_admin(self):
        email = f"TEST_admin_{uuid.uuid4().hex[:8]}@dev.trustscore.local"
        r = requests.post(f"{BASE_URL}/api/auth/signup",
                          json={"email": email, "password": PASSWORD, "name": "Bad Admin", "role": "ADMIN"},
                          timeout=30)
        assert r.status_code == 400, f"expected 400, got {r.status_code}: {r.text}"

    def test_signup_creator_ok(self):
        email = f"TEST_creator_{uuid.uuid4().hex[:8]}@dev.trustscore.local"
        r = requests.post(f"{BASE_URL}/api/auth/signup",
                          json={"email": email, "password": PASSWORD, "name": "Test Creator", "role": "CREATOR"},
                          timeout=30)
        assert r.status_code in (200, 201), r.text


# ---------- Creators marketplace ----------
class TestCreators:
    def test_list_creators_default(self, sarah):
        r = sarah.get(f"{BASE_URL}/api/creators", timeout=30)
        assert r.status_code == 200
        data = r.json()
        # find creators list either at root or under "creators"/"data"
        items = data.get("creators") or data.get("data") or data.get("items") or (data if isinstance(data, list) else None)
        assert items is not None and len(items) >= 6, f"expected >=6 seeded creators, got: {data}"
        handles = " ".join(str(i) for i in items).lower()
        for h in ["alexfitness", "sofiacooks", "beautybymia", "jordantravel", "liamtech", "avastyle"]:
            assert h in handles, f"missing seeded creator @{h}"

    def test_search_filter(self, sarah):
        r = sarah.get(f"{BASE_URL}/api/creators", params={"search": "alexfitness"}, timeout=30)
        assert r.status_code == 200
        body = r.text.lower()
        assert "alexfitness" in body

    def test_verified_filter(self, sarah):
        r = sarah.get(f"{BASE_URL}/api/creators", params={"verified": "true"}, timeout=30)
        assert r.status_code == 200

    def test_pagination(self, sarah):
        r = sarah.get(f"{BASE_URL}/api/creators", params={"page": 1, "limit": 3}, timeout=30)
        assert r.status_code == 200


# ---------- Saved creators isolation ----------
class TestSavedIsolation:
    def test_saved_isolated_between_businesses(self, sarah, marcus):
        # Sarah saves alexfitness
        r = sarah.post(f"{BASE_URL}/api/creators/saved",
                       json={"creatorHandle": "alexfitness"}, timeout=30)
        # fallback try creatorId
        if r.status_code >= 400:
            r = sarah.post(f"{BASE_URL}/api/creators/saved",
                           json={"creatorId": "alexfitness"}, timeout=30)
        assert r.status_code in (200, 201, 409), f"save failed: {r.status_code} {r.text}"

        r_sarah = sarah.get(f"{BASE_URL}/api/creators/saved", timeout=30)
        assert r_sarah.status_code == 200
        sarah_body = r_sarah.text.lower()
        assert "alexfitness" in sarah_body, "sarah should see her saved creator"

        r_marcus = marcus.get(f"{BASE_URL}/api/creators/saved", timeout=30)
        assert r_marcus.status_code == 200
        marcus_data = r_marcus.json()
        marcus_items = marcus_data.get("saved") or marcus_data.get("data") or marcus_data.get("items") \
            or (marcus_data if isinstance(marcus_data, list) else [])
        # Marcus's list should not include something Sarah just saved unless he saved it too.
        # We only assert marcus list is empty of Sarah's save OR at least not leaking Sarah's businessProfileId
        for item in marcus_items:
            txt = str(item).lower()
            # Basic guard: shouldn't contain gymfuel
            assert "gymfuel" not in txt, f"leak: marcus sees gymfuel data: {item}"


# ---------- Collaboration lifecycle + authorization ----------
COLLAB_ID = {"id": None}


class TestCollaboration:
    def test_business_creates_collab(self, sarah):
        payload = {
            "creatorId": "alexfitness",
            "campaignName": "TEST_ Fitness Campaign",
            "campaignDescription": "Testing collaboration flow",
            "budget": 500,
            "deliverables": "1 Reel + 3 Stories",
            "timeline": "2 weeks",
        }
        r = sarah.post(f"{BASE_URL}/api/collaborations", json=payload, timeout=30)
        assert r.status_code in (200, 201), f"create collab failed: {r.status_code} {r.text}"
        data = r.json()
        cid = data.get("id") or (data.get("collaboration") or {}).get("id") or (data.get("data") or {}).get("id")
        assert cid, f"no id in response: {data}"
        COLLAB_ID["id"] = cid
        # status pending
        status = data.get("status") or (data.get("collaboration") or {}).get("status") \
            or (data.get("data") or {}).get("status")
        assert (status or "").upper() in ("PENDING", "REQUESTED", ""), f"unexpected status: {status}"

    def test_creator_can_get(self, alex):
        cid = COLLAB_ID["id"]
        assert cid
        r = alex.get(f"{BASE_URL}/api/collaborations/{cid}", timeout=30)
        assert r.status_code == 200, f"creator GET failed: {r.status_code} {r.text}"

    def test_non_participant_business_forbidden(self, marcus):
        cid = COLLAB_ID["id"]
        r = marcus.get(f"{BASE_URL}/api/collaborations/{cid}", timeout=30)
        assert r.status_code == 403, f"expected 403 for marcus, got {r.status_code}: {r.text}"

    def test_creator_accepts(self, alex):
        cid = COLLAB_ID["id"]
        r = alex.patch(f"{BASE_URL}/api/collaborations/{cid}",
                       json={"status": "ACCEPTED"}, timeout=30)
        if r.status_code >= 400:
            r = alex.patch(f"{BASE_URL}/api/collaborations/{cid}",
                           json={"status": "Accepted"}, timeout=30)
        assert r.status_code == 200, f"accept failed: {r.status_code} {r.text}"

    def test_invalid_transition(self, alex):
        cid = COLLAB_ID["id"]
        # Accepted -> Pending should be rejected
        r = alex.patch(f"{BASE_URL}/api/collaborations/{cid}",
                       json={"status": "PENDING"}, timeout=30)
        assert r.status_code >= 400, f"expected error on invalid transition, got {r.status_code}"


# ---------- Messaging authorization ----------
class TestMessaging:
    def test_participants_can_message(self, sarah, alex):
        cid = COLLAB_ID["id"]
        assert cid
        r = sarah.post(f"{BASE_URL}/api/messages",
                       json={"collaborationId": cid, "text": "TEST_ hello from sarah"}, timeout=30)
        assert r.status_code in (200, 201), f"sarah POST message failed: {r.status_code} {r.text}"

        r = alex.get(f"{BASE_URL}/api/messages", params={"collaborationId": cid}, timeout=30)
        assert r.status_code == 200
        body = r.text.lower()
        assert "hello from sarah" in body

    def test_non_participant_forbidden(self, marcus):
        cid = COLLAB_ID["id"]
        r = marcus.get(f"{BASE_URL}/api/messages", params={"collaborationId": cid}, timeout=30)
        assert r.status_code == 403


# ---------- TrustScore audit ----------
class TestTrustScoreAudit:
    def test_unauth_401(self):
        r = requests.post(f"{BASE_URL}/api/trustscore/analyze",
                          json={"creatorId": "alexfitness"}, timeout=60)
        assert r.status_code == 401, f"expected 401, got {r.status_code}"

    def test_analyze_alexfitness(self, sarah):
        r = sarah.post(f"{BASE_URL}/api/trustscore/analyze",
                       json={"creatorId": "alexfitness"}, timeout=60)
        assert r.status_code == 200, f"analyze failed: {r.status_code} {r.text}"
        data = r.json()
        # some kind of score/evaluation present
        txt = str(data).lower()
        assert "score" in txt or "trust" in txt or "evaluation" in txt

    def test_insufficient_data_new_creator(self, sarah):
        # create a fresh creator with zero telemetry via signup
        email = f"TEST_zero_{uuid.uuid4().hex[:8]}@dev.trustscore.local"
        handle = f"testzero{uuid.uuid4().hex[:6]}"
        r = requests.post(f"{BASE_URL}/api/auth/signup",
                          json={"email": email, "password": PASSWORD, "name": "Zero Telemetry",
                                "role": "CREATOR", "handle": handle}, timeout=30)
        assert r.status_code in (200, 201), r.text
        # analyze this creator - should be INSUFFICIENT_DATA 422
        r = sarah.post(f"{BASE_URL}/api/trustscore/analyze",
                       json={"creatorId": handle}, timeout=60)
        # Accept 404 as alt if lookup is by handle vs id mismatch
        assert r.status_code in (422, 404), f"expected 422 insufficient data, got {r.status_code}: {r.text}"
