# The Mark Does Not Stay / 刻痕留在船上

## Premise / 起点

**The Mark Does Not Stay** turns the Chinese idiom **刻舟求剑** (marking a boat to find a lost sword) into a navigable memory space. A person leaves a mark on a moving boat when something disappears into the river, then tries to return to the place later. The mark has travelled; the river has travelled; so has the person.

《刻痕留在船上》把“刻舟求剑”变成一个可以航行的记忆空间。当某样东西落入河中，人先在不断移动的船上刻下记号，之后试图循着它回到原处。但船已经走了，河流也已经走了，人也不再是当时的人。

> I thought I was returning to a place. But the place had already moved, and perhaps I had too. The ghost is not what remains there. It is the mark I keep making after it is gone.

> 我以为我在回到一个地方。但那个地方早已移动，也许我也是。鬼不是仍留在那里的东西。鬼是它离开以后，我仍不断刻下的记号。

## Core relationship / 核心关系

| The object / 那个东西 | The mark / 船上的刻痕 |
| --- | --- |
| visible, near, but untouchable | touchable, present, but wrong |
| remains at a world position in the river | moves with the boat |
| a memory that cannot be recovered exactly | the urge to fix a memory in place |

The work asks: **is the ghost my attachment, or the thing itself? Am I actively revisiting a place, or being pulled back into it?**

## Current experience / 当前体验

1. Enter a quiet, dark river.
2. Navigate a sail-less boat with `W / ↑` (forward), `S / ↓` (return), `A / D` (turn), or drag to look around.
3. Click the glowing mark and leave a word or short phrase.
4. The word is sent to an image model, which creates one translucent, luminous memory-object.
5. That object stays in the world while the boat moves away. The boat can get close, but a ghost radius makes direct contact impossible; near it becomes dimmer and more incorporeal.

The current demo supports multiple releases in one journey. Its boat follows the camera gently so it remains legible while the viewer explores.

## Intended next interaction / 下一步交互

Each released object should produce a **new physical notch on the boat hull**. The object should appear at the boat’s actual world position (ideally with a small falling animation) while the notch stays local to the vessel. This is the full gesture of 刻舟求剑; it is the next build step, not yet claimed as complete.

## Relationship to Ghost Archive / 与 Ghost Archive 的关系

**Ghost Archive** is the interior room: an archive where anonymous records can resonate with one another. **The Mark Does Not Stay** is the exterior water: a memory becomes impossible to pin down once it enters time and motion.

Planned bridge: `Ghost Archive room → drawer → a small carving tool → water transition → private boat journey`

The carving tool is an archival instrument, not a weapon. In a later version, choosing a Ghost Archive record could seed one object in the river.

## Technical structure / 技术结构

- **Three.js** renders the real-time scene: water, fog, light, navigation, camera, a genuine turnable 3D boat, and memory objects.
- The boat is hand-built from Three.js geometry so it can turn and move in space. Its current material is translucent and lantern-like; a wood-hull version with accumulating carved marks is planned.
- Each generated memory object is currently a transparent **2.5D sprite** in the 3D world, not a downloadable 3D model / GLB.
- The scene currently runs as a static browser page. It does **not** yet persist journeys to Firebase.

### Future data boundary

Shared Ghost Archive records and a person’s boat journey should remain separate. A later Firebase design can save private boat state under a Firebase Anonymous Authentication user ID, e.g. `/voyages/{uid}`, while the anonymous shared archive stays under its own path. Do not store names with either experience by default.

## Replicate connection / Replicate 连接

The prototype calls the NYU ITP proxy rather than exposing an API token in the browser:

`POST https://itp-ima-replicate-proxy.web.app/api/create_n_get`

It currently requests model `openai/gpt-image-2.6-flare:715b575d9fbff13d006fc63d1ca2c24a1d5bc8cb8f6a957342a7a9126b38195f` with `aspect_ratio: "1:1"`, `background: "transparent"`, `output_format: "png"`, `quality: "medium"`, `complexity: "low"`, and `number_of_images: 1`.

The browser waits for the proxy’s completed image URL, loads it as a Three.js texture, and places it as a sprite at the boat’s current world position. Each release is an actual model request and uses the school proxy quota.

## Image prompt language / 视觉提示词

### Reusable visual spine

`Delicate dark outline, pale translucent material, a warm dim light within, surreal handmade illustration, isolated object, fully transparent background.`

### Memory-object prompt template

`A single small luminous memory object inspired by the word "{word}". The object itself should be a clear poetic interpretation of that word, not automatically a tree. It may be a tree only if the word suggests a tree. Delicate dark outline, pale translucent material, a warm dim light within, surreal handmade illustration, isolated object, no person, no water, no ground, no text, fully transparent background.`

### Earlier boat visual study prompt

`A single sail-less translucent river vessel, clearly shaped like a narrow boat with a pointed bow and pointed stern, not a capsule and not a kayak. Pale milky translucent membrane stretched over very thin dark ribs, warm amber light glowing from inside the hollow hull. Elegant, fragile, weightless, surreal handmade illustration. Three-quarter side view, no people, no sail, no oars, no water, no scenery, no shadow, no text. IMPORTANT: output a clean isolated boat cutout; every pixel outside the boat must have alpha 0 / fully transparent background. No gray, black, white, or gradient backdrop.`

## What is already true vs. next / 已完成与下一步

**Working now**: real-time river, navigable boat, camera follow, multiple generated image objects, transparent PNG generation via the ITP proxy, object/boat non-contact behavior, and a static browser deployment.

**Next**: wood boat material; a unique accumulating hull mark for each release; true falling / world-placement gesture; Firebase persistence for personal journeys; the transition from the Ghost Archive room to the river.
