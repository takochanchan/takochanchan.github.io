#!/usr/bin/env python3
"""Configure keyless GA4 report access from the takochan statistics workflow.
Run in Google Cloud Shell using an account permitted to configure federation.
This does not change organization policies or create service account keys.
"""
import argparse
import json
import re
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--project", required=True)
parser.add_argument("--property-id", required=True)
args = parser.parse_args()
if not re.fullmatch(r"[a-z][a-z0-9-]{4,28}[a-z0-9]", args.project):
    parser.error("Invalid Google Cloud project ID")
if not re.fullmatch(r"[0-9]+", args.property_id):
    parser.error("The GA4 property ID must contain only numbers")

service_account = f"takochan-stats@{args.project}.iam.gserviceaccount.com"
pool_id = "takochan-statistics"
provider_id = "github"
repository_id = "1310601565"
owner_id = "308618393"
workflow_ref = "takochanchan/takochanchan.github.io/.github/workflows/analytics-stats.yml@refs/heads/main"
issuer = "https://token.actions.githubusercontent.com"
mapping = {
    "google.subject": "assertion.sub",
    "attribute.repository_id": "assertion.repository_id",
    "attribute.repository_owner_id": "assertion.repository_owner_id",
    "attribute.ref": "assertion.ref",
    "attribute.workflow_ref": "assertion.workflow_ref",
    "attribute.event_name": "assertion.event_name",
}
condition = (
    f"assertion.repository_owner_id == '{owner_id}' && "
    f"assertion.repository_id == '{repository_id}' && "
    "assertion.ref == 'refs/heads/main' && "
    f"assertion.workflow_ref == '{workflow_ref}' && "
    "assertion.event_name in ['schedule', 'workflow_dispatch']"
)

def gcloud(*command):
    result = subprocess.run(
        ["gcloud", *command, "--project", args.project, "--format=json", "--quiet"],
        text=True, capture_output=True,
    )
    if result.returncode:
        raise SystemExit(
            "Google Cloud setup stopped. No organization policy was changed.\n"
            + result.stderr.strip()
        )
    return json.loads(result.stdout) if result.stdout.strip() else None

gcloud("services", "enable", "analyticsdata.googleapis.com", "iam.googleapis.com",
       "iamcredentials.googleapis.com", "sts.googleapis.com",
       "cloudresourcemanager.googleapis.com")
account = gcloud("iam", "service-accounts", "describe", service_account)
if account.get("disabled"):
    raise SystemExit("The selected service account is disabled; review it manually.")
project = gcloud("projects", "describe", args.project)
pool_name = f"projects/{project['projectNumber']}/locations/global/workloadIdentityPools/{pool_id}"
provider_name = f"{pool_name}/providers/{provider_id}"
pools = gcloud("iam", "workload-identity-pools", "list", "--location=global") or []
pool = next((item for item in pools if item["name"] == pool_name), None)
if pool is None:
    gcloud("iam", "workload-identity-pools", "create", pool_id, "--location=global",
           "--display-name=Takochan statistics",
           "--description=Keyless access for the main statistics workflow only")
elif pool.get("disabled") or pool.get("state") != "ACTIVE":
    raise SystemExit("The existing statistics pool is not active; review it manually.")
providers = gcloud("iam", "workload-identity-pools", "providers", "list",
                   "--location=global", f"--workload-identity-pool={pool_id}") or []
if any(item["name"] != provider_name for item in providers):
    raise SystemExit("The pool contains another provider; review it manually before granting access.")
provider = next((item for item in providers if item["name"] == provider_name), None)
if provider is None:
    gcloud("iam", "workload-identity-pools", "providers", "create-oidc", provider_id,
           "--location=global", f"--workload-identity-pool={pool_id}",
           "--display-name=Takochan GitHub statistics",
           f"--issuer-uri={issuer}",
           "--attribute-mapping=" + ",".join(f"{k}={v}" for k, v in mapping.items()),
           f"--attribute-condition={condition}")
provider = gcloud("iam", "workload-identity-pools", "providers", "describe", provider_id,
                  "--location=global", f"--workload-identity-pool={pool_id}")
if (provider.get("disabled") or provider.get("state") != "ACTIVE"
        or provider.get("attributeMapping") != mapping
        or provider.get("attributeCondition") != condition
        or provider.get("oidc", {}).get("issuerUri", "").rstrip("/") != issuer
        or provider.get("oidc", {}).get("allowedAudiences")):
    raise SystemExit("Provider settings differ from the restricted configuration; review them manually.")
gcloud("iam", "service-accounts", "add-iam-policy-binding", service_account,
       "--role=roles/iam.workloadIdentityUser",
       f"--member=principalSet://iam.googleapis.com/{pool_name}/attribute.repository_id/{repository_id}",
       "--condition=None")

print("\nKeyless authentication configured. No JSON key was created.")
print("Register these repository Actions Variables, setting GA4_STATS_ENABLED last:")
print(f"GA4_PROPERTY_ID={args.property_id}")
print(f"GA4_SERVICE_ACCOUNT_EMAIL={service_account}")
print(f"GA4_WIF_PROVIDER={provider_name}")
print("GA4_STATS_ENABLED=true")
print("Keep the service account's GA4 role as Viewer on this property only.")
print("Allow up to five minutes for IAM propagation, then run Update public download statistics on main.")
