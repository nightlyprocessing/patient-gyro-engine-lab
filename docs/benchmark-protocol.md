# Prototype specification and measurement protocol

**Planned only. No implementation or measurements yet.** Run after the initial viability gate passes.

## Original scene

Create `pg_foodtruck`, a small sealed BSP map with a courtyard, an accessible food truck kitchen, a serving window, curb, two picnic tables, and a simple office/apartment facade surrounding the courtyard. Use original textures, primitive models, signage, font/HUD assets, and generated original mono sound files. Keep every asset's origin and license in a manifest. Avoid dependencies on valve.wad, retail models, Half-Life sounds, or downloaded HLDS game content.

Provide two separated player spawn points. Player one begins at the serving window. Player two begins by the tables. One original NPC customer follows a short waypoint loop between the table and window. Make the server authoritative for position, animation/state, and interaction. Both clients must see the same NPC, and reconnecting must restore current state.

FPS controls: click Enter to acquire pointer lock and unlock audio, WASD movement, mouse look, collision, jump, and E to interact. Escape releases input. Phones need a left movement stick, right look region, interact/jump buttons, safe-area handling, and clear orientation support. Do not require a phone keyboard. Resize/orientation changes must retain the session.

Place a generator sound beside the truck and a grill sound inside. Validate left/right panning by rotating, attenuation by moving away, and listener updates while moving. Test simultaneous sources. Do not claim HRTF or occlusion unless implemented and measured. Environmental positional audio must not request microphone permission.

## Functional gates

- Two independent browser clients connect to the same cloud server, observe each other's movement, and remain connected for ten minutes.
- Server limits the session to two players. A second tab without a connection is not a second player.
- One NPC updates visibly on both clients and survives one client's reconnect.
- Collision prevents walking through truck walls. Controls remain usable after focus loss, fullscreen exit, phone rotation, and reconnect.
- Audio starts after an explicit gesture and tracks listener position/orientation. No mandatory microphone prompt.
- No external Valve asset download or user local-folder upload is required.

## Proposed performance targets

These are lab acceptance targets, not measured results or promises.

| Platform | Fixed render size | Target |
| --- | --- | --- |
| Desktop GPU, current Chrome and Firefox | 1280 x 720 | Mean >= 60 FPS and p95 frame time <= 25 ms |
| Physical Android Chrome | 960 x 540 | Mean >= 30 FPS and p95 frame time <= 50 ms |
| Physical iPhone Safari | 960 x 540 | Mean >= 30 FPS and p95 frame time <= 50 ms |

Record actual output framebuffer dimensions, DPR, renderer, GPU, model, OS/browser version, refresh rate, build/source hashes, server region, and transport. Avoid uncapped high-DPR resolution when comparing platforms. Report median and worst runs, not only the best.

## Repeatable runs

1. Use an immutable HTTPS build and isolated two-player room. Record transferred/compressed payload sizes and hashes.
2. Perform three cold and three warm launches, recording time from Enter to the first interactive rendered map frame. Report cache conditions.
3. Warm up for 30 seconds. Both players then follow the same 120-second route: outside loop, enter kitchen, interact with NPC, turn around audio source, return to spawn. Repeat three times.
4. Collect engine-render frame timestamps, average FPS, p50/p95/p99 frame time, one-percent-low FPS definition, stalls over 50/100 ms, and memory/heap growth. requestAnimationFrame timing alone must be labeled presentation cadence if engine render timing is unavailable.
5. On physical phones run a ten-minute sustained session. Record final-two-minute performance, crashes, input failures, background/resume, battery/temperature data if the remote lab exposes it. Keep power/charging conditions consistent.
6. Test broadband and a recorded constrained network profile. Collect server/client RTT, packet loss, reconnect time, transport fallback, and NPC synchronization errors. Distinguish imposed impairment from actual mobile network results.
7. Validate both players' movements and NPC state from server logs and clients. A screenshot does not establish multiplayer synchronization.

Cloud-only actual-device testing requires a remote physical-device service supporting WebGL/WASM, interactive touch input, WebRTC/UDP reachability, and instrumentation. An emulator, mobile viewport, user-agent override, CPU throttle, or software-rendered cloud desktop must not be labeled a physical-phone result.

## Recommendation rule

Do not recommend migration until source/license/hosting and functional gates pass and desktop plus physical-phone runs meet the selected targets. Compare with the existing application under equivalent scene complexity, resolution, and devices in a separately authorized benchmark. Evaluate content workflow, download size, mobile controls, server operating cost, and fork-maintenance burden alongside FPS.

If physical-phone testing is unavailable, keep phone results null and the migration decision pending. No hardware-performance estimate should fill a missing measurement.
