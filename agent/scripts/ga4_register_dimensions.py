#!/usr/bin/env python3
"""Register QuantBattle's event parameters as GA4 custom dimensions.

One-off admin task, separate from the agent's read-only login: it asks for
the analytics.edit scope for this run only and never saves that token.
Already-registered parameters are skipped, so it is safe to re-run.

Usage:  npm run ga4:register-dimensions
Needs:  the "Google Analytics Admin API" enabled in your Cloud project, and
        Editor (or Administrator) access on the GA4 property.
"""
import os
import sys
import warnings

warnings.filterwarnings("ignore", category=FutureWarning, module=r"google\..*")
warnings.filterwarnings("ignore", message=r".*OpenSSL.*")

from ga4_login import AGENT_DIR, CONFIG_DIR, load_dotenv, resolve  # noqa: E402

EDIT_SCOPE = "https://www.googleapis.com/auth/analytics.edit"
API = "https://analyticsadmin.googleapis.com/v1beta"

# parameterName -> (displayName, description). Event-scoped; must match the
# params sent by analytics.js / game code. question_id is deliberately absent
# (too many distinct values for GA4; the server event store handles it).
DIMENSIONS = {
    "game": ("Game", "Which game: optiver_80_in_8, mental_math_challenge, battle, practice"),
    "difficulty": ("Difficulty", "Difficulty tier of the game or question"),
    "category": ("Category", "Battle/question category: tech, quant, ib"),
    "opponent_type": ("Opponent type", "bot or human"),
    "is_quant_battle": ("Is quant battle", "true for the two-phase Quant Battle"),
    "end_reason": ("End reason", "How a game ended: timer or finished"),
    "reason": ("Abandon reason", "Why a game was abandoned: quit or page_exit"),
    "phase": ("Game phase", "Phase when abandoned: question, blitz, tactical, waiting"),
    "action": ("Post game action", "What the player did after a result: rematch, retry, practice, leave"),
}


def main():
    load_dotenv(AGENT_DIR / ".env")
    prop = os.environ.get("GA4_PROPERTY_ID")
    if not prop:
        sys.exit("GA4_PROPERTY_ID is not set in agent/.env")
    client_file = resolve("GA4_OAUTH_CLIENT_FILE", CONFIG_DIR / "oauth-client.json")
    if not client_file.exists():
        sys.exit(f"Desktop OAuth client file not found at {client_file} (see agent/README.md > GA4 login).")

    from google.auth.transport.requests import AuthorizedSession
    from google_auth_oauthlib.flow import InstalledAppFlow

    flow = InstalledAppFlow.from_client_secrets_file(str(client_file), scopes=[EDIT_SCOPE])
    print("Opening your browser to grant one-time EDIT access to Google Analytics…")
    creds = flow.run_local_server(
        host="localhost", port=0, open_browser=True,
        authorization_prompt_message="If the browser didn't open, visit:\n{url}\n",
        success_message="Access granted for this run only. You can close this tab.",
    )
    session = AuthorizedSession(creds)  # in memory only; nothing is written to disk

    base = f"{API}/properties/{prop}/customDimensions"
    existing, page = set(), None
    while True:
        r = session.get(base, params={"pageSize": 200, **({"pageToken": page} if page else {})})
        if r.status_code == 403:
            sys.exit("403 from the Admin API: enable 'Google Analytics Admin API' in your Cloud project "
                     "and make sure your account has Editor access on the GA4 property.\n" + r.text)
        r.raise_for_status()
        body = r.json()
        existing |= {d["parameterName"] for d in body.get("customDimensions", [])}
        page = body.get("nextPageToken")
        if not page:
            break

    created, failed = [], []
    for param, (display, desc) in DIMENSIONS.items():
        if param in existing:
            print(f"  = {param:16} already registered")
            continue
        r = session.post(base, json={"parameterName": param, "displayName": display, "description": desc, "scope": "EVENT"})
        if r.ok:
            created.append(param)
            print(f"  + {param:16} registered as '{display}'")
        else:
            failed.append(param)
            print(f"  ! {param:16} failed: {r.status_code} {r.text.strip()[:200]}")

    print(f"\n{len(created)} created, {len(DIMENSIONS) - len(created) - len(failed)} already there, {len(failed)} failed.")
    print("GA4 only fills new dimensions for events received after registration (allow 24-48h).")
    print("Optional: revoke the edit grant at https://myaccount.google.com/permissions (your read-only login is a separate grant).")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
