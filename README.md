# V11 Asset Refinement

A Codex-assisted workflow for turning an authored 3D scene into inspectable, editable asset groups.

**[Open the live demo](https://lcqii.github.io/v11-asset-refinement-demo/)** · [中文教程](docs/README.zh-CN.md)

![V11 neutral geometry viewer](docs/overview.jpg)

**28 asset groups · interactive inspection · individual GLB export · no build step**

This public demo contains neutral geometry and a small browser-based inspector. Select a shelf, cabinet, counter, or other group; focus it; isolate it; then export an editable GLB. The complete scene is also available as a GLB.

## Run locally

Download or clone this repository, then run from its root:

```sh
python3 -m http.server 8000
```

Open [localhost:8000](http://localhost:8000) in a current browser with WebGL support. Use an HTTP server rather than opening `index.html` directly. The geometry is about 43 MB, so the first load can take a moment. Three.js is bundled locally; no CDN or API key is needed.

## Try one complete workflow

1. Start in **Overview** to see the scene in context. Drag to orbit, scroll to zoom, and right-drag to pan.
2. Select **Island shelf 01** in the asset library. Its geometry is highlighted and its mesh count appears below the viewport.
3. Click **Focus**, then **Isolate**. Toggle **Wireframe** to inspect the structure.
4. Click **Export asset** to download `asset-01.glb`. In Blender, choose **File → Import → glTF 2.0**, then select that file. The group remains a hierarchy of editable mesh parts.
5. Click **Show all**, choose **Overview**, or press **Escape** to return to the complete scene.

Search filters the asset library. The **Aisle** and **Side** viewpoints offer additional inspection angles. **Download complete GLB** gives the entire released scene, without requiring an export in the browser.

## What Codex helped build

Codex was used to implement the viewer, scene inspection controls, asset selection, export tooling, and release checks. Human direction defined the asset refinement goals and what could be shared. The useful pattern is a short feedback loop: specify a concrete inspection task, implement it, inspect the actual geometry, and verify the exported result.

This repository demonstrates that inspection and editing workflow. It is not a complete automatic photo-to-3D reconstruction system, and it does not reproduce the full authoring process from raw input.

## Release scope

- Only geometry, transforms, hierarchy, and a neutral material are included.
- Original photographs, texture images, camera records, source notes, and identifying metadata are excluded.
- Object labels are generic. There are no people photographs in this release.
- The model is authored geometry: hidden surfaces and dimensions include estimates. Its scale is approximate, and it must not be treated as a survey, an inventory record, or a reconstruction accuracy benchmark.

The released GLB was rebuilt from selected position, normal, and index accessors. Its binary buffer contains only those packed geometry values; unused image bytes were not retained. See [release checks](docs/release-checks.md).

## Files

| Path | Purpose |
| --- | --- |
| `index.html`, `styles.css`, `app.js` | Static viewer and inspection workflow |
| `assets/v11-neutral.glb` | Neutral scene geometry |
| `assets/manifest.json` | Generic asset labels and scene summary |
| `vendor/three/` | Bundled Three.js runtime and required modules |
| `docs/` | Preview, walkthrough, and release notes |

Read the [Chinese walkthrough](docs/README.zh-CN.md) for the same workflow in Chinese.

## Licensing

The original viewer code is MIT licensed; see [LICENSE](LICENSE). Three.js retains its own [MIT license](vendor/three/LICENSE). The demonstration geometry in `assets/` is provided for viewing and inspection; it is excluded from the code's MIT license, and no additional asset license is granted here.
