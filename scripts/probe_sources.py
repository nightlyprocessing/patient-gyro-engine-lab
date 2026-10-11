#!/usr/bin/env python3
"""MIT-licensed public source availability probe. Run in a cloud runner."""
import concurrent.futures
import datetime
import json
import sys
import urllib.error
import urllib.request

CHECKS = [
    ("official_engine", "repos/FWGS/xash3d-fwgs", False),
    ("browser_fork", "repos/sealdev224/webxash3d-fwgs-cstrike", False),
    ("recorded_engine_source", "repos/yohimik/xash3d-fwgs", True),
    ("recorded_sdk_source", "repos/yohimik/hlsdk-portable", True),
    ("recorded_server_integration", "repos/yohimik/goxash3d-fwgs", True),
    ("partial_engine_pin_recovery", "repos/FWGS/xash3d-fwgs/commits/f85aa0c8f7d46c27191132b44d872c8e331308de", False),
    ("partial_sdk_pin_recovery", "repos/FWGS/hlsdk-portable/commits/2073065d1359d3582f034617a097931f8595b10e", False),
]


def probe(check):
    name, endpoint, required = check
    url = "https://api.github.com/" + endpoint
    result = {"name": name, "url": url, "required_for_recorded_build": required}
    request = urllib.request.Request(url, headers={
        "User-Agent": "patient-gyro-engine-lab-source-probe",
        "Accept": "application/vnd.github+json",
    })
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            data = json.load(response)
            result.update(http_status=response.status, available=True)
            result["metadata"] = {k: data.get(k) for k in (
                "full_name", "default_branch", "archived", "pushed_at", "sha"
            ) if k in data}
    except urllib.error.HTTPError as error:
        result.update(http_status=error.code, available=False)
        result["error"] = "Public endpoint unavailable. This does not prove deletion."
    except (urllib.error.URLError, TimeoutError, OSError, ValueError) as error:
        result.update(http_status=None, available=False, error=type(error).__name__)
    return result


def main():
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(probe, CHECKS))
    passed = all(r["available"] for r in results if r["required_for_recorded_build"])
    print(json.dumps({
        "checked_at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "recorded_source_urls_available": passed,
        "interpretation": "URL availability only. Does not prove recursive build reproducibility or license clearance.",
        "results": results,
    }, indent=2))
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
