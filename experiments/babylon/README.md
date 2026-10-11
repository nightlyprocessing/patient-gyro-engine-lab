# Patient Gyro: Babylon.js experiment

An isolated cloud-hosted original food-truck FPS experiment. Babylon.js 9.30.0 renders a procedural urban courtyard, an accessible truck kitchen, a walking customer, and another player. No Valve assets, Xash binaries, third-party retail game data, external image files, or CDN scripts are used.

## Play

Choose **Enter the truck** to explore solo, or **Two-player room** to create a cloud session. Copy the room link and open it in another independently authorized tab/browser. Private Site access still applies. The server admits at most two clients.

Desktop: WASD/arrow movement, mouse look after clicking, Shift run, Space jump, E interaction, Escape releases pointer lock. Use Click to resume afterward. The rear doorway is at the opposite end from the cab. The serving window is on the patio side.

Touch: left joystick moves, swipe the right side to look, and use Jump/Interact. Low quality is the default on coarse-pointer devices. Orientation/resize adjusts the canvas.

Approach the customer to talk, the serving window to open/close its shutter, or the kitchen grill to switch it. Shared sessions replicate those interactions and the NPC's server-derived position. Audio starts after entering, uses original synthesized sources with Web Audio HRTF panners, and does not request microphone access.

## Backend

A Worker handles HTTPS input/state snapshots every 250 ms and D1 stores two player slots per room. Clients predict movement and interpolate remote characters. The server validates speed, collision, sequence, token and interaction proximity. A unique database index prevents over-admission, including simultaneous joins. Slots expire after 15 seconds without heartbeats. Rooms without players are removed on subsequent joins after 24 hours.

This is a lightweight prototype transport, not a competitive FPS netcode implementation. Current prediction/reconciliation is approximate and remote movement updates at 4 Hz. The lab does not use WebSockets, WebRTC, a native game server, or an engine-maintained multiplayer service.

## Build and check in cloud

Install dependencies with the Sites dependency helper. `npm run db:generate` creates the initial schema migration. `npm test` verifies shared state, admission, input validation, collision and slot recovery with actual SQLite. `npm run build` bundles client and Worker into a self-contained deploy artifact and copies the migrations into `.openai/drizzle`. `npm run validate` checks that the artifact exports the Worker fetch handler.

Authoritative source is in `src/`, `db/`, `tests/`, and `scripts/build-lab.mjs`. `worker/index.js` and `dist/` are generated. Do not edit generated bundles.

## Measurements and limits

Metrics displays frame cadence, p95, framebuffer size, draw-call count, memory when exposed, and HTTPS request round-trip time. Reset before a measured route. Export saves a JSON sample from the currently running browser and explicitly marks physical device verification false.

No browser visual QA or GPU desktop/physical-phone performance was available during creation. A successful build and server tests are not an FPS benchmark. Actual physical phones need a remote device lab to preserve cloud-only testing. The current Patient Gyro project was not edited or migrated.

Scene is an original procedural/stylized test, with simplified geometry and synthetic sound. It is not a photorealistic asset set, cooking simulation, recorded dialogue, or measured production-ready game.

## Licensing

Lab-authored code is MIT. Babylon.js is Apache-2.0 with its notices included in `THIRD_PARTY_NOTICES.md`. No optional Havok runtime is used.
