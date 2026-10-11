# Patient Gyro Engine Lab

Isolated, cloud-only game-engine experiments for Patient Gyro.

## Babylon.js prototype 0.1

[Open the private cloud lab](https://patient-gyro-babylon-lab.nightlyprocessing.chatgpt.site). [Source and controls](experiments/babylon/README.md). [Verification status](docs/babylon-prototype.md).

Implemented: an original food-truck courtyard, accessible kitchen, FPS and touch controls, a walking customer, spatial audio and two-player HTTPS sessions. Build and four backend tests pass. Browser visual QA and desktop/physical-phone performance remain unmeasured. This is a distinct experiment and does not validate Xash3D.

## Xash3D investigation

## Current decision, 2026-10-11

**HOLD: initial viability gate not passed. No migration recommendation and no Xash3D prototype.**

Browser execution is demonstrably possible in the ecosystem. A reproducible, independently licensed, phone-ready Patient Gyro build has not been established. The audited browser fork has inaccessible source dependencies, engine/SDK licensing remains unresolved, and its multiplayer backend requires hosting capabilities beyond standard Sites hosting.

This is a conditional assessment, not a claim that Xash3D cannot run in a browser. Restoring exact source dependencies and resolving distribution rights could reopen the prototype gate.

- [Feasibility assessment](docs/feasibility.md)
- [Prototype and benchmark protocol](docs/benchmark-protocol.md)
- [Recorded evidence](research/evidence.json)
- [Cloud source availability probe](scripts/probe_sources.py)

## Isolation

This repository is separate from `nightlyprocessing/patient-gyro`. The existing application was not edited, replaced, or deployed during this investigation. Research checkouts and commands ran in a cloud execution environment. No user computer, home server, router, or local game installation was accessed.

## Prototype status

| Requirement | Status |
| --- | --- |
| Original food truck map | Specified, not authored or compiled |
| Two connected players | Not implemented or verified |
| One synchronized NPC | Not implemented or verified |
| FPS mouse and keyboard controls | Ecosystem capability, not verified for this lab |
| Phone touch controls | Unresolved |
| Positional audio | Required test, not verified for this lab |
| Desktop performance | Unmeasured |
| Actual phone performance | Unmeasured |
| Multiplayer cloud deployment | Not provisioned |
| Existing project migration | Not started |

Do not interpret a viewport emulator, CPU throttling, or cloud software rendering as a physical phone benchmark. No FPS numbers are claimed.

## Recheck sources in a cloud runner

```sh
python3 scripts/probe_sources.py > source-probe.json
```

The probe uses public GitHub API endpoints without credentials, records HTTP errors as evidence, and exits unsuccessfully when required browser build sources are unavailable. A public 404 means unavailable to this probe, not proof of deletion.

Lab-authored probe code is MIT licensed. That license does not apply to upstream engine code, SDK code, game assets, or third-party packages.
