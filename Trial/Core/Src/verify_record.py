import argparse
import copy
import hashlib
import hmac
import json
import sys

import requests
import secrets as app_secrets

ATLAS_APP_ID = app_secrets.ATLAS_APP_ID
ATLAS_API_KEY = app_secrets.ATLAS_API_KEY
ATLAS_DATA_SOURCE = app_secrets.ATLAS_DATA_SOURCE
ATLAS_DB = app_secrets.ATLAS_DB
ATLAS_COLLECTION = app_secrets.ATLAS_COLLECTION
HASH_TWEAK_SECRET = app_secrets.HASH_TWEAK_SECRET
SOLANA_RPC_URL = getattr(app_secrets, "SOLANA_RPC_URL", "https://api.devnet.solana.com")

ATLAS_FIND_ONE_URL = f"https://data.mongodb-api.com/app/{ATLAS_APP_ID}/endpoint/data/v1/action/findOne"


def canonical_json(payload):
    return json.dumps(payload, separators=(",", ":"), sort_keys=True)


def compute_actual_hash(payload):
    canonical = canonical_json(payload).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()


def compute_modified_hash(actual_hash_hex):
    digest = hmac.new(
        HASH_TWEAK_SECRET.encode("utf-8"),
        actual_hash_hex.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return digest


def find_document_by_modified_hash(modified_hash):
    headers = {
        "Content-Type": "application/json",
        "api-key": ATLAS_API_KEY,
    }
    payload = {
        "dataSource": ATLAS_DATA_SOURCE,
        "database": ATLAS_DB,
        "collection": ATLAS_COLLECTION,
        "filter": {"proof.modifiedHash": modified_hash},
    }

    response = requests.post(ATLAS_FIND_ONE_URL, headers=headers, data=json.dumps(payload), timeout=15)
    response.raise_for_status()
    body = response.json()
    return body.get("document")


def verify_solana_signature(signature):
    if not signature:
        return False, "No signature present"

    rpc_payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getSignatureStatuses",
        "params": [[signature], {"searchTransactionHistory": True}],
    }

    response = requests.post(SOLANA_RPC_URL, json=rpc_payload, timeout=15)
    response.raise_for_status()
    body = response.json()

    value = body.get("result", {}).get("value", [])
    if not value or value[0] is None:
        return False, "Signature not found on RPC"

    status = value[0]
    if status.get("err") is not None:
        return False, f"On-chain error: {status.get('err')}"

    return True, status.get("confirmationStatus", "unknown")


def strip_non_hashed_fields(document):
    base = copy.deepcopy(document)
    base.pop("_id", None)
    base.pop("proof", None)
    return base


def main():
    parser = argparse.ArgumentParser(description="Verify DB record integrity using blockchain hash + modified hash")
    parser.add_argument("--actual-hash", required=True, help="Actual SHA-256 hash stored/anchored on-chain")
    parser.add_argument("--check-chain", action="store_true", help="Also verify Solana tx signature status")
    args = parser.parse_args()

    expected_actual_hash = args.actual_hash.strip().lower()
    expected_modified_hash = compute_modified_hash(expected_actual_hash)

    print("Expected modified hash:", expected_modified_hash)
    document = find_document_by_modified_hash(expected_modified_hash)
    if not document:
        print("FAIL: No MongoDB document found for this modified hash")
        sys.exit(1)

    proof = document.get("proof", {})
    stored_actual_hash = str(proof.get("actualHash", "")).lower()
    stored_modified_hash = str(proof.get("modifiedHash", "")).lower()

    if stored_actual_hash != expected_actual_hash:
        print("FAIL: Stored actual hash does not match input actual hash")
        sys.exit(1)

    if stored_modified_hash != expected_modified_hash:
        print("FAIL: Stored modified hash does not match computed modified hash")
        sys.exit(1)

    base = strip_non_hashed_fields(document)
    recomputed_actual_hash = compute_actual_hash(base).lower()
    if recomputed_actual_hash != expected_actual_hash:
        print("FAIL: Payload integrity mismatch (recomputed hash differs)")
        print("Expected:", expected_actual_hash)
        print("Got     :", recomputed_actual_hash)
        sys.exit(1)

    print("PASS: Hash linkage and payload integrity verified")

    if args.check_chain:
        signature = proof.get("solana", {}).get("txSignature")
        ok, detail = verify_solana_signature(signature)
        if not ok:
            print("FAIL: Chain verification failed:", detail)
            sys.exit(1)
        print("PASS: Chain signature status:", detail)


if __name__ == "__main__":
    main()
