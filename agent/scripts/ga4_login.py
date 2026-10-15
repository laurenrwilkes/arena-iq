#!/usr/bin/env python3
"""One-time GA4 login for the QuantBattle engagement agent.

Runs Google's installed-app OAuth flow with a Desktop OAuth client, asking
only for the analytics.readonly scope, and caches the resulting
authorized-user credentials (incl. refresh token) outside the repository.
The Node agent (src/ga4/client.js) reads that file.

Usage:  npm run ga4:login          (sets up a venv and runs this script)

Paths (override in agent/.env or the environment):
  GA4_OAUTH_CLIENT_FILE  Desktop OAuth client JSON downloaded from Google Cloud
                         default: ~/.config/quantbattle/oauth-client.json
  GA4_OAUTH_TOKEN_FILE   where the authorized-user credentials are cached
                         default: ~/.config/quantbattle/ga4-authorized-user.json
"""
import json
import os
import sys
import warnings
from pathlib import Path

# macOS's bundled Python 3.9 triggers end-of-life/LibreSSL notices from
# google-auth and urllib3; they don't affect this flow.
warnings.filterwarnings("ignore", category=FutureWarning, module=r"google\..*")
warnings.filterwarnings("ignore", message=r".*OpenSSL.*")

SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]
AGENT_DIR = Path(__file__).resolve().parent.parent
REPO_DIR = AGENT_DIR.parent
CONFIG_DIR = Path.home() / ".config" / "quantbattle"


def load_dotenv(path):
    """Minimal .env reader so the script honours agent/.env path overrides."""
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def resolve(var, default):
    raw = os.environ.get(var) or str(default)
    return Path(raw).expanduser().resolve()


def main():
    load_dotenv(AGENT_DIR / ".env")
    client_file = resolve("GA4_OAUTH_CLIENT_FILE", CONFIG_DIR / "oauth-client.json")
    token_file = resolve("GA4_OAUTH_TOKEN_FILE", CONFIG_DIR / "ga4-authorized-user.json")

    for p in (client_file, token_file):
        if REPO_DIR in p.parents:
            sys.exit(f"Refusing to use {p}: OAuth files must live outside the repository ({REPO_DIR}).")
    if not client_file.exists():
        sys.exit(
            f"Desktop OAuth client file not found at {client_file}.\n"
            "Create a Desktop OAuth client in Google Cloud, download its JSON and move it there "
            "(see agent/README.md > GA4 login)."
        )
    kind = next(iter(json.loads(client_file.read_text())), None)
    if kind != "installed":
        sys.exit(f"{client_file} is a '{kind}' client. Create one with application type 'Desktop app'.")

    from google_auth_oauthlib.flow import InstalledAppFlow

    flow = InstalledAppFlow.from_client_secrets_file(str(client_file), scopes=SCOPES)
    print("Opening your browser for Google sign-in (read-only Analytics access)…")
    creds = flow.run_local_server(
        host="localhost",
        port=0,
        open_browser=True,
        access_type="offline",   # we need a refresh token
        prompt="consent",        # force one even if consent was granted before
        authorization_prompt_message="If the browser didn't open, visit:\n{url}\n",
        success_message="QuantBattle agent is authorized. You can close this tab.",
    )
    if not creds.refresh_token:
        sys.exit("Google returned no refresh token. Remove the app's access at "
                 "https://myaccount.google.com/permissions and run the login again.")
    granted = set(creds.scopes or SCOPES)
    if granted != set(SCOPES):
        sys.exit(f"Unexpected scopes granted: {sorted(granted)}. Only analytics.readonly is allowed.")

    data = json.loads(creds.to_json())
    data["type"] = "authorized_user"  # format google-auth-library (Node) expects
    data.pop("token", None)           # short-lived access token: not worth caching
    data.pop("expiry", None)

    token_file.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    os.chmod(token_file.parent, 0o700)
    fd = os.open(str(token_file), os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as fh:
        json.dump(data, fh, indent=2)
    os.chmod(token_file, 0o600)
    print(f"Saved credentials to {token_file} (readable only by you).")
    print("Next: npm run test:ga4")


if __name__ == "__main__":
    main()
