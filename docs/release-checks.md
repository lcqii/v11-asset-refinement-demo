# Release checks

This release contains 28 generic asset groups, 2,584 mesh definitions and 2,621 scene nodes. Mesh definitions can contain multiple primitives, so they are not the same as rendered draw calls or individual inventory objects.

The GLB was rebuilt into a new document. Its included data is limited to:

- Mesh positions, normals and triangle indices.
- Node transforms and hierarchy.
- Generic labels and one neutral material.

All 6,571 retained accessors were repacked into a new binary buffer and checked against their selected geometry values. No original binary chunk was copied wholesale. The released GLB has zero images, zero textures, no UV coordinates, no vertex colors, no camera definitions, no source extras, and no external resource links.

The viewer was checked with a complete scene, a focused and isolated shelf, an alternate viewpoint, asset filtering, and GLB export. The export was parsed again to check its hierarchy and geometry. Preview screenshots show the actual released geometry.

These are packaging and workflow checks. They do not establish measurement accuracy or completeness against a real scene.
