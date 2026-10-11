# Xash3D browser feasibility assessment

Assessment date: October 11, 2026. All investigation ran in a cloud environment. The existing Patient Gyro repository and deployment were not changed.

## Decision

**HOLD at the initial viability gate.** Browser execution is technically credible, but the audited path is not currently a reproducible, cleared, phone-ready foundation for an independent Patient Gyro prototype. No migration recommendation is made. No desktop or phone performance measurements exist for this lab.

The requested playable test was conditional on viability. It was not built because source recovery and distribution rights remain unresolved. This is an engineering gate, not a conclusion that WebAssembly cannot render this scene. The next useful work is exact dependency recovery and a rights decision, rather than building a substitute demo and presenting it as Xash3D.

## Source availability and maintenance

| Component | Observed evidence | Implication |
| --- | --- | --- |
| FWGS/xash3d-fwgs | Public cloud checkout succeeded at `fd0cd6afdda9dff94346af60884b99876001ca5f`. Commit timestamp resolves to October 11, 2026 UTC. | Native engine development is active. |
| Official platform documentation | Emscripten is listed as Old Engine with no maintainer. WASI is orphaned. | Official supported-platform status does not establish a maintained browser product. WASI is not a browser graphics port. |
| FWGS/xash3d | Historical Emscripten instructions depend on patched fastcomp. GitHub marks the repository archived February 16, 2026. | Historical instructions are not the preferred modern WASM route. |
| yohimik/webxash3d-fwgs | Public API and web retrieval returned 404. | Unavailable to this investigation. A 404 does not prove deletion. |
| swtkiptr/webxash3d-fwgs | Checkout succeeded at `1911262bb35ab360edcff701d95f5171fef482da`, last commit June 13, 2025 UTC. API last push June 16, 2025. README says mobile currently crashes. | Surviving older snapshot, not evidence of current phone support. |
| sealdev224/webxash3d-fwgs-cstrike | Checkout succeeded at `ed3ec1fc3781c5dedd1dd52c23b2d96bfed7584c`, May 23, 2026. Includes Emscripten 4.0.23 Docker build, TypeScript wrapper, WebGL renderer, and Go/Pion server integration. | More modern browser route exists. A recent README edit alone does not establish active runtime maintenance. |
| Browser fork engine and SDK | Exact source submodule checkout failed. Recorded URLs under yohimik return public API 404. Engine pin is `f85aa0c8f7d46c27191132b44d872c8e331308de`. SDK pin is `2073065d1359d3582f034617a097931f8595b10e`. | Fresh documented build cannot reproduce its source dependencies as recorded. |
| Partial source recovery | FWGS engine commit API resolved the browser engine pin. FWGS SDK commit API did not resolve the matching SDK pin, returning 422. yohimik/goxash3d-fwgs public API returned 404. | Engine recovery may be possible. Complete engine, SDK, server integration, and recursive dependency recovery has not been demonstrated. |
| x8BitRain/webXash | Public frontend, last API push January 28, 2026. README delegates engine bugs to the unavailable yohimik repository and recommends keyboard/mouse for mobile. | Useful frontend reference, not a phone-readiness guarantee. |

The modern fork's package metadata advertises MIT, but this applies to wrapper code and does not replace licenses of compiled dependencies. Prebuilt npm/WASM availability was not verified. Using a prebuilt executable would not solve corresponding-source, compatibility, or rights questions.

## Licensing and game assets

GoldSrc itself should not be treated as an openly licensed engine source release. Xash3D is a compatibility implementation, and the Half-Life SDK is game-interface/game-logic source with its own terms.

The checked FWGS tree has GPLv3-or-later notices in engine source and Valve SDK restrictions in headers such as `common/entity_state.h`. That header limits use to noncommercial enhancements of Valve products unless written permission is obtained. Valve's SDK LICENSE permits free distribution of modified Valve games and SDK code and directs commercial users to contact Valve. These terms do not establish a blanket right to distribute an independent Patient Gyro game.

Upstream issue #63 remains open and discusses the license incompatibility. PR #2194 is also open and describes only partial resolution through replacement headers. Maintainer statements and discussions are evidence of unresolved provenance and licensing work, not a court ruling. This assessment does not claim the whole engine is illegal or repeat the unproven allegation that it is entirely leaked source.

Original maps, textures, models, sprites, HUD, fonts, and sounds are necessary, but do not remove engine/header/SDK restrictions. Buying Half-Life does not grant rights to redistribute its assets in a public food truck game. The stock browser Dockerfile also downloads third-party-packaged HLDS content. It is not an appropriate original-only Patient Gyro distribution recipe.

Before serving compiled client WASM, establish the applicable source-distribution obligations and resolve the SDK-dependent portions. Loading separate WASM game modules into one runtime is not by itself a demonstrated license solution. Private cloud experiments and a shipped independent game should be assessed separately. No third-party binaries or Valve assets were redistributed by this lab.

## Multiplayer and hosting

Browsers cannot directly connect to arbitrary native UDP game servers. Emscripten documents WebSocket emulation, POSIX proxying, and custom WebRTC integration. Full POSIX proxying is mainly a debugging option, not an automatic low-latency production solution.

There are two plausible cloud architectures:

| Path | Architecture | Tradeoff |
| --- | --- | --- |
| WebSocket bridge | Browser WASM client, HTTPS/WSS gateway, fixed native Xash dedicated server | Easier proxy deployment. TCP ordering can add delays after packet loss. The bridge must match the port's protocol. |
| WebRTC | Browser WASM client, HTTPS/WSS signaling, Pion data channels, native Xash server integration | Audited fork implements unordered data channels with zero retransmits. Needs UDP-capable hosting, ICE/NAT handling, and fallback testing. |

The audited Pion integration serves HTTP/signaling on 27016 and configures a public UDP mux, with the sample using 27018. Its Go server embeds native engine integration rather than merely redirecting an unmodified HLDS server. Sample code has no configured TURN service, accepts all WebSocket origins, and includes voice media tracks. For this lab, microphone/voice capture is unnecessary. Positional environmental audio must be validated separately from voice chat.

A cloud VM or persistent container with the required ports and an HTTPS entry point could host this architecture. TURN or an established fallback would be needed to test restrictive mobile networks. No cloud VM/container provider is connected or provisioned in this session, and no paid infrastructure was ordered.

Sites guidance specifies Cloudflare Worker hosting, 128 MB per isolate, HTTP-based external connections, and no raw TCP. Standard Sites hosting therefore cannot run this native dedicated-server/Pion/UDP stack as written. A browser frontend could be hosted separately while the game server runs on a suitable cloud host.

Two players must mean two independently connected clients receiving authoritative world state. An NPC in stock deathmatch logic is not automatically a co-op NPC. A game module must explicitly spawn, update, and replicate the NPC, and the two clients must agree on its behavior. Building original game logic also requires native server and compatible WASM client/game modules. Stock x86 game DLLs cannot simply be loaded in browser WASM.

## Performance and verification

No engine runtime, compiled food truck map, two-player session, NPC, or audio test was launched. Desktop FPS, phone FPS, frame time, memory, startup time, and network latency are all **unmeasured**. Source inspection cannot supply performance numbers.

The current toolset does not expose a remote physical-phone test service. Cloud desktop automation or a mobile viewport would provide functional/emulated evidence only. Actual Android and iOS performance would require a remote device lab, or an explicitly revised cloud-only constraint. There is no reason to access the user's phone for this assessment.

Native GoldSrc/Xash performance on older hardware is encouraging background context, not evidence that this WASM build will meet phone targets. Rendering compatibility layers, resident asset memory, browser input, startup compilation, thermal throttling, and network transport all need measurements.

## Conditions to reopen the prototype gate

1. Recover exact browser engine, SDK, server integration, and recursive build dependencies. Pin source commits and toolchain/image digests, then prove a fresh cloud build.
2. Resolve applicable engine/SDK redistribution rights or select a cleared implementation with original compatible game code. Document the decision before hosting downloadable binaries.
3. Identify cloud hosting that can run the authoritative native server and supported browser transport.
4. Build and verify the original-only scene defined in the benchmark protocol. Add working touch controls before claiming phone usability.
5. Measure desktop and physical phones against the same immutable build before any migration recommendation.

## Primary sources

- [FWGS engine](https://github.com/FWGS/xash3d-fwgs), including the inspected commit and file headers.
- [Official port status](https://github.com/FWGS/xash3d-fwgs/blob/master/Documentation/ports.md).
- [Historical Emscripten instructions](https://github.com/FWGS/xash3d/blob/master/ports/README.emscripten.md).
- [Audited modern browser fork](https://github.com/sealdev224/webxash3d-fwgs-cstrike), including `.gitmodules`, package Dockerfiles, `docker/cs-web-server/src/server/sfu.go`, and client `webrtc.ts`.
- [Surviving older browser snapshot](https://github.com/swtkiptr/webxash3d-fwgs).
- [WebXash frontend](https://github.com/x8BitRain/webXash).
- [Valve SDK license](https://github.com/ValveSoftware/halflife/blob/master/LICENSE).
- [License issue #63](https://github.com/FWGS/xash3d-fwgs/issues/63).
- [Partial header replacement PR #2194](https://github.com/FWGS/xash3d-fwgs/pull/2194).
- [Emscripten networking documentation](https://emscripten.org/docs/porting/networking.html).

Repository write attempt: `nightlyprocessing/patient-gyro-engine-lab` was discoverable, but creating README.md returned HTTP 403, Resource not accessible by integration. This initial attempt created no commit. After the user updated access, README.md was successfully committed as `755b707ef71cf5584bf05eeb7bd790f1bd113474` and the remaining assessment files were prepared for upload.
