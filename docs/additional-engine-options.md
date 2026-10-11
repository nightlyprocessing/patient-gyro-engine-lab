# Additional engine possibilities

Research date: 2026-10-11. Parallel source research only. No alternative runtime, prototype, desktop benchmark, or phone benchmark was executed. This is a shortlist for investigation, not a migration recommendation.

## Delivery and engine licensing are separate decisions

Netflix announced mobile GTA III, Vice City, and San Andreas Definitive Edition titles in November 2023. Its mobile-game documentation describes downloading a separate app through the App Store or Google Play, then launching and authenticating with Netflix. This does not establish browser/WebAssembly performance. Current availability of the GTA titles was not established in this investigation.

Cloud-only development can produce either a browser build or a native mobile app. In both cases the player's device ordinarily renders the scene. A third route is GPU cloud rendering with streamed video and remote input, such as Unreal Pixel Streaming. That introduces ongoing GPU infrastructure cost and input/network-latency testing.

## Comparison

| Engine | License / source model | Useful investigation | Material test gates |
| --- | --- | --- | --- |
| Babylon.js | Apache-2.0, open source | Browser-first 3D with integrated cameras, collisions, animation and spatial/directional audio | Implement original gameplay and authoritative multiplayer backend. Verify touch controls, mobile memory, sustained performance and audio. Use WebGL baseline before relying on WebGPU. Audit optional dependencies separately. |
| Godot | MIT, open source | Full scene/game editor, browser output plus native Android and iOS possibilities | Browser Compatibility renderer/WebGL2 only. Current web docs exclude C# web export. Default Sample audio can mishandle positional audio and lacks effects. Stream audio improves features but increases latency. Threads need isolation headers. iOS export needs macOS/Xcode, which can be a cloud worker. |
| FTEQW | GPL-2.0, open source | Quake-family retro FPS using original QuakeC game logic and assets | Official build script includes Emscripten and Android. Must prove present-day toolchain build, browser-compatible server transport, touch controls and spatial audio. Native iOS support was not established. Engine/game-code licensing must be audited per component. |
| Unity | Proprietary commercial engine | Mature native mobile pipeline and a modern browser export comparator | Unity 6.3 officially documents mobile-browser support. Older statements that all Unity web builds are unsupported on phones are stale. Test actual build size, memory, controls and audio on hardware. |
| Unreal | Proprietary, source-accessible under Epic terms | Native high-detail game or GPU cloud-streaming experiment | Source access is not an open-source license. Pixel Streaming sends rendered video to browsers and needs a GPU server. Do not treat streaming as a comparable client-rendered WASM benchmark. |

None of Babylon.js, Godot, or an original QuakeC FTE project is a drop-in GoldSrc replacement. A separate prototype would recreate the gameplay and import/build assets through that engine's workflow.

Babylon's open-source license does not mean every optional plugin has available source. In particular, the published Havok integration supplies runtime WASM/JS artifacts. Avoid making a blanket source-availability claim for optional physics dependencies.

## Proposed controlled investigations

1. Browser lane: Babylon.js, original food-truck scene, first-person and touch controls, one animated NPC, positional grill/fan/traffic sound, two clients backed by a persistent cloud session server.
2. Full-engine lane: Godot equivalent scene with a web build. Compare default Sample and Stream audio. Inspect Android and cloud-Mac iOS export feasibility without using the user's computer.
3. Retro lane: FTEQW clean Emscripten build and original QuakeC game logic, followed by an exact browser transport check. Native server documentation alone does not prove browser connectivity.
4. Preserve the current Three.js project as an independent baseline. Three.js already provides positional audio. No edits or migration are authorized by this research report.

Use the existing benchmark protocol for identical resolution, scene/content budgets, scripted route, two-client state checks and actual physical phones. A remote phone lab is still required to satisfy cloud-only hardware measurements.

## Immersion requirements

Treat believable scale and collision, deliberate lighting, detailed surroundings, responsive interactions, visible NPC behavior, spatial sound and ambient motion as explicit test requirements. Engine feature lists do not create these features automatically.

For the truck: accessible kitchen, functioning serving window, utensils and ingredients, grill hiss, generator hum, customer footsteps and responses. For the surroundings: sidewalk/curb, office and apartment facades, animated street details, convincing shadows and depth. Use an original glTF asset set where practical for the Babylon/Godot comparison, and document any FTE-specific conversion.

Do not infer performance from a native mobile GTA release or promise a frame rate from engine documentation.

## Primary sources

- Netflix GTA announcement: https://about.netflix.com/en/news/grand-theft-auto-the-trilogy-the-definitive-edition-arrives-on-netflix
- Netflix mobile game installation: https://help.netflix.com/en/node/121442
- Babylon source/license: https://github.com/BabylonJS/Babylon.js
- Babylon specifications: https://www.babylonjs.com/specifications/
- Babylon audio: https://doc.babylonjs.com/features/featuresDeepDive/audio
- Babylon multiplayer guidance: https://doc.babylonjs.com/guidedLearning/networking/
- Godot license: https://godotengine.org/license/
- Godot web export restrictions: https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html
- Godot Android export: https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_android.html
- Godot iOS export: https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_ios.html
- FTEQW source/license: https://github.com/fte-team/fteqw
- FTEQW browser/Android build script: https://github.com/fte-team/fteqw/blob/master/build_wip.sh
- FTEQW browser Quake II limitation: https://github.com/fte-team/fteqw/issues/273
- Unity 6.3 browser support: https://docs.unity3d.com/6000.3/Documentation/Manual/webgl-browsercompatibility.html
- Unreal source-access terms: https://www.unrealengine.com/en-US/ue-on-github
- Unreal Pixel Streaming: https://dev.epicgames.com/documentation/en-us/unreal-engine/pixel-streaming-in-unreal-engine
- Three.js positional audio: https://threejs.org/docs/pages/PositionalAudio.html

Repository write access was successfully restored for nightlyprocessing/patient-gyro-engine-lab. The original assessment, probe and benchmark protocol were committed separately from the existing Patient Gyro project.
