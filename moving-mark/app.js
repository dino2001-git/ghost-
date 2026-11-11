import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07100d, 0.026);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .1, 100);
camera.position.set(0, 2.4, 8.2);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x070b0b, 1);
document.querySelector('#scene').prepend(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.enablePan = false; controls.minDistance = 4; controls.maxDistance = 12;
controls.maxPolarAngle = Math.PI * .59; controls.target.set(0, .1, 0);

scene.add(new THREE.HemisphereLight(0x657c72, 0x070907, 1.45));
const glow = new THREE.PointLight(0xd9b76c, 16, 15, 2); glow.position.set(-2, 3, 2); scene.add(glow);

// A low-poly river plane: it is deliberately not realistic water.
const waterGeo = new THREE.PlaneGeometry(70, 70, 70, 70);
waterGeo.rotateX(-Math.PI / 2);
const water = new THREE.Mesh(waterGeo, new THREE.MeshStandardMaterial({ color: 0x112822, roughness: .52, metalness: .16 }));
scene.add(water);
const original = waterGeo.attributes.position.array.slice();

// A weightless, lantern-like vessel: no sail, only a visible outline and an interior light.
const boat = new THREE.Group(); boat.position.y = .22; boat.rotation.z = -.055; scene.add(boat);
const glass = new THREE.MeshPhysicalMaterial({ color: 0xd9e6db, transparent: true, opacity: .34, roughness: .12, metalness: 0, transmission: .25, thickness: .5, emissive: 0x5f4c23, emissiveIntensity: .38, side: THREE.DoubleSide });
// A custom loft, not a capsule: the bow and stern taper to points, while the middle opens into a hull.
const sections = [
  { z: -2.05, w: .025, h: .025, y: .06 },
  { z: -1.55, w: .34, h: .34, y: -.03 },
  { z: -.72, w: .68, h: .48, y: -.08 },
  { z: .48, w: .72, h: .5, y: -.08 },
  { z: 1.42, w: .43, h: .38, y: -.01 },
  { z: 1.96, w: .025, h: .025, y: .08 }
];
const ringCount = 12, vertices = [], indices = [];
sections.forEach(section => {
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    vertices.push(Math.cos(angle) * section.w, section.y + Math.sin(angle) * section.h, section.z);
  }
});
for (let s = 0; s < sections.length - 1; s++) {
  for (let i = 0; i < ringCount; i++) {
    const next = (i + 1) % ringCount, a = s * ringCount + i, b = (s + 1) * ringCount + i, c = (s + 1) * ringCount + next, d = s * ringCount + next;
    indices.push(a, b, d, b, c, d);
  }
}
const hullGeo = new THREE.BufferGeometry(); hullGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); hullGeo.setIndex(indices); hullGeo.computeVertexNormals();
boat.add(new THREE.Mesh(hullGeo, glass));
const darkFrame = new THREE.MeshBasicMaterial({ color: 0x332d29, transparent: true, opacity: .78 });
const tube = (points, radius = .018) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 20, radius, 6, false), darkFrame);
// The two rails trace the opening, so the silhouette reads immediately as a boat.
boat.add(tube(sections.map(s => new THREE.Vector3(-s.w, s.y + s.h * .72, s.z)), .023));
boat.add(tube(sections.map(s => new THREE.Vector3(s.w, s.y + s.h * .72, s.z)), .023));
boat.add(tube(sections.map(s => new THREE.Vector3(0, s.y - s.h, s.z)), .025));
sections.slice(1, -1).forEach(s => {
  const arc = [new THREE.Vector3(-s.w, s.y + s.h * .72, s.z), new THREE.Vector3(-s.w * .72, s.y - s.h * .62, s.z), new THREE.Vector3(0, s.y - s.h, s.z), new THREE.Vector3(s.w * .72, s.y - s.h * .62, s.z), new THREE.Vector3(s.w, s.y + s.h * .72, s.z)];
  boat.add(tube(arc));
});
const innerGlow = new THREE.PointLight(0xf6c86d, 7, 4.3, 2); innerGlow.position.set(0, .14, -.12); boat.add(innerGlow);
const glowCore = new THREE.Mesh(new THREE.SphereGeometry(.22, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd87b, transparent: true, opacity: .82 })); glowCore.position.y = .1; boat.add(glowCore);

// The notch uses a glowing hand-drawn line. Replace this group later with a transparent Replicate-generated PNG on a THREE.Sprite.
const notch = new THREE.Group(); notch.position.set(.66, -.05, .55); boat.add(notch);
const notchMaterial = new THREE.MeshBasicMaterial({ color: 0xe1b65f, transparent: true, opacity: .94 });
[-.14, 0, .14].forEach((x, i) => { const line = new THREE.Mesh(new THREE.BoxGeometry(.045, .34 + (i === 1 ? .1 : 0), .025), notchMaterial); line.position.x = x; line.rotation.z = i === 1 ? .3 : -.12; notch.add(line); });

// The PNG is kept as a visual study, but the boat itself stays a genuine 3D mesh so it can turn in space.
const vesselTexture = new THREE.TextureLoader().load('./lantern-vessel-transparent.png');
vesselTexture.colorSpace = THREE.SRGBColorSpace;
const vesselSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: vesselTexture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .9 }));
vesselSprite.scale.set(5.8, 3.87, 1); vesselSprite.position.set(0, .2, 0); boat.add(vesselSprite);
vesselSprite.visible = false;

// Sparse shoreline strokes make the boat's motion legible, while never becoming a destination.
const reeds = [];
for (let i = 0; i < 38; i++) {
  const z = -22 + Math.random() * 44, side = Math.random() > .5 ? 1 : -1;
  const reed = new THREE.Mesh(new THREE.BoxGeometry(.025, .6 + Math.random() * 1.8, .025), new THREE.MeshBasicMaterial({ color: 0x3d5039, transparent: true, opacity: .25 + Math.random() * .22 }));
  reed.position.set(side * (4.8 + Math.random() * 10), reed.geometry.parameters.height / 2 - .05, z); reed.rotation.z = (Math.random() - .5) * .4; reed.userData.side = side; scene.add(reed); reeds.push(reed);
}
// Near-water markers make motion perceptible; they stay in the river while the boat passes them.
for (let i = 0; i < 18; i++) {
  const marker = new THREE.Mesh(new THREE.SphereGeometry(.05 + Math.random() * .07, 8, 8), new THREE.MeshBasicMaterial({ color: 0x8d956d, transparent: true, opacity: .32 }));
  marker.position.set((Math.random() - .5) * 5.5, .03, -18 + Math.random() * 36); scene.add(marker);
}

const opening = document.querySelector('#opening'), line = document.querySelector('#line'), hint = document.querySelector('.hint'), mark = document.querySelector('#mark');
let begun = false, t = 0, pushing = false, returning = false, turningLeft = false, turningRight = false, velocity = 0, heading = 0;
const memories = [];
const lastBoatPosition = boat.position.clone();
document.querySelector('#enter').onclick = () => { begun = true; opening.classList.add('gone'); setTimeout(() => { line.classList.add('show'); hint.classList.add('show'); mark.classList.add('show'); }, 900); };
mark.onclick = () => { document.querySelector('#memory').hidden = false; line.textContent = 'The river did not return with me.'; };
async function growMemoryObject(word) {
  const response = await fetch('https://itp-ima-replicate-proxy.web.app/api/create_n_get', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai/gpt-image-2.6-flare:715b575d9fbff13d006fc63d1ca2c24a1d5bc8cb8f6a957342a7a9126b38195f',
      input: { prompt: `A single small luminous memory object inspired by the word "${word}". The object itself should be a clear poetic interpretation of that word, not automatically a tree. It may be a tree only if the word suggests a tree. Delicate dark outline, pale translucent material, a warm dim light within, surreal handmade illustration, isolated object, no person, no water, no ground, no text, fully transparent background.`, aspect_ratio: '1:1', background: 'transparent', output_format: 'png', quality: 'medium', complexity: 'low', number_of_images: 1 }
    })
  });
  const data = await response.json();
  const url = Array.isArray(data.output) ? data.output[0] : data.output;
  if (!response.ok || data.status !== 'succeeded' || typeof url !== 'string') throw new Error('The tree could not grow.');
  return new Promise((resolve, reject) => new THREE.TextureLoader().load(url, texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
    const tree = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .9 }));
    tree.scale.set(2.8, 2.8, 1); tree.position.copy(boat.position); tree.position.y = .95;
    scene.add(tree); resolve(tree);
  }, undefined, reject));
}
document.querySelector('#release').onclick = async () => {
  const value = document.querySelector('#words').value.trim(); if (!value) return;
  const button = document.querySelector('#release'); button.disabled = true; line.textContent = 'A memory object is taking shape…';
  try {
    const sprite = await growMemoryObject(value.slice(0, 40));
    memories.push({ sprite, word: value.slice(0, 40), home: sprite.position.clone(), ghostRadius: 2.35 });
    document.querySelector('#words').value = '';
    document.querySelector('#memory').hidden = true; line.textContent = 'You left it here. The river carries you onward.';
  } catch (error) { line.textContent = error.message; }
  finally { button.disabled = false; }
};
addEventListener('keydown', event => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target.isContentEditable) return;
  const key = event.key.toLowerCase();
  if (event.key === 'ArrowUp' || key === 'w') { pushing = true; event.preventDefault(); }
  if (event.key === 'ArrowDown' || key === 's') { returning = true; event.preventDefault(); }
  if (key === 'a' || event.key === 'ArrowLeft') turningLeft = true;
  if (key === 'd' || event.key === 'ArrowRight') turningRight = true;
});
addEventListener('keyup', event => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target.isContentEditable) return;
  const key = event.key.toLowerCase();
  if (event.key === 'ArrowUp' || key === 'w') pushing = false;
  if (event.key === 'ArrowDown' || key === 's') returning = false;
  if (key === 'a' || event.key === 'ArrowLeft') turningLeft = false;
  if (key === 'd' || event.key === 'ArrowRight') turningRight = false;
});

addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
function animate() {
  requestAnimationFrame(animate); t += .008;
  const pos = waterGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = original[i * 3], z = original[i * 3 + 2]; pos.array[i * 3 + 1] = Math.sin(x * .4 + t * 1.5) * .08 + Math.cos(z * .31 + t) * .06; }
  pos.needsUpdate = true; waterGeo.computeVertexNormals();
  if (begun) {
    // The user can push forward, but cannot reverse: the river keeps the central metaphor intact.
    // The river only nudges the vessel; meaningful travel is a deliberate action.
    const targetVelocity = pushing ? .075 : returning ? -.06 : .002;
    velocity += (targetVelocity - velocity) * .035;
    if (turningLeft) heading += .009; if (turningRight) heading -= .009;
    boat.position.y = .22 + Math.sin(t * 1.4) * .075; boat.rotation.z = -.055 + Math.sin(t) * .027; boat.rotation.y = heading; glow.intensity = 13 + Math.sin(t * .6) * 3;
    const forwardX = -Math.sin(heading), forwardZ = -Math.cos(heading);
    boat.position.x += forwardX * velocity; boat.position.z += forwardZ * velocity;
    // Elastic follow: the user can orbit freely, but the vessel cannot quietly leave the frame.
    const desiredTarget = boat.position.clone(); desiredTarget.y += .18;
    const followDelta = desiredTarget.sub(controls.target).multiplyScalar(.075); followDelta.y = 0;
    camera.position.add(followDelta); controls.target.add(followDelta); lastBoatPosition.copy(boat.position);
  }
  memories.forEach(memory => {
    const dx = memory.sprite.position.x - boat.position.x, dz = memory.sprite.position.z - boat.position.z;
    const distance = Math.hypot(dx, dz);
    const material = memory.sprite.material;
    if (distance < memory.ghostRadius) {
      // The object becomes more ghostlike instead of colliding: near is possible, contact is not.
      const safeDistance = Math.max(distance, .001);
      const awayX = distance < .001 ? Math.sin(heading + Math.PI / 2) : dx / safeDistance;
      const awayZ = distance < .001 ? Math.cos(heading + Math.PI / 2) : dz / safeDistance;
      const push = (memory.ghostRadius - distance) * .13;
      memory.sprite.position.x += awayX * push; memory.sprite.position.z += awayZ * push;
      memory.sprite.position.y += (.15 - memory.sprite.position.y) * .08;
      material.opacity += (.25 - material.opacity) * .09;
    } else {
      memory.sprite.position.y += (.95 - memory.sprite.position.y) * .04;
      material.opacity += (.9 - material.opacity) * .04;
    }
  });
  controls.update(); renderer.render(scene, camera);
}
animate();
