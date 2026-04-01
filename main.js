import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#story-canvas');
const descriptionEl = document.querySelector('#story-description');
const controlsEl = document.querySelector('#story-controls');
const selectEl = document.querySelector('#story-select');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0d1324, 16, 70);

const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 150);
camera.position.set(10, 8, 16);

const orbit = new OrbitControls(camera, canvas);
orbit.enableDamping = true;
orbit.dampingFactor = 0.05;
orbit.minDistance = 7;
orbit.maxDistance = 28;
orbit.maxPolarAngle = Math.PI * 0.47;
orbit.target.set(0, 2, 0);

const hemi = new THREE.HemisphereLight(0x9fc1ff, 0x213040, 0.95);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight(0xfff2d4, 1.4);
keyLight.position.set(8, 14, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -20;
keyLight.shadow.camera.right = 20;
keyLight.shadow.camera.top = 20;
keyLight.shadow.camera.bottom = -20;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x80a8ff, 0.7);
rimLight.position.set(-10, 8, -8);
scene.add(rimLight);

const storyRoot = new THREE.Group();
scene.add(storyRoot);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(15, 64),
  new THREE.MeshStandardMaterial({
    color: 0x31476d,
    roughness: 0.84,
    metalness: 0.08,
    emissive: 0x0a1023,
    emissiveIntensity: 0.25,
  })
);
ground.receiveShadow = true;
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const stars = (() => {
  const geometry = new THREE.BufferGeometry();
  const count = 1800;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 160;
    positions[i + 1] = Math.random() * 80 + 8;
    positions[i + 2] = (Math.random() - 0.5) * 160;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: 0xe9f1ff, size: 0.25, transparent: true, opacity: 0.7 })
  );
})();
scene.add(stars);

const particleSystem = (() => {
  const count = 450;
  const positions = new Float32Array(count * 3);
  const base = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random() * 9;
    const y = Math.random() * 5 + 0.2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const j = i * 3;
    positions[j] = x;
    positions[j + 1] = y;
    positions[j + 2] = z;
    base[j] = x;
    base[j + 1] = y;
    base[j + 2] = z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xfff2a8,
      size: 0.16,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

  return { points, base, positions, geometry };
})();
scene.add(particleSystem.points);

const mat = {
  hero: new THREE.MeshStandardMaterial({ color: 0xff8f6b, roughness: 0.35, metalness: 0.04 }),
  friend: new THREE.MeshStandardMaterial({ color: 0x73d9ff, roughness: 0.4, metalness: 0.03 }),
  prop: new THREE.MeshStandardMaterial({ color: 0x9ea7ff, roughness: 0.5, metalness: 0.1 }),
  accent: new THREE.MeshStandardMaterial({ color: 0xffdf7b, roughness: 0.28, metalness: 0.12 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x66c979, roughness: 0.82, metalness: 0.02 }),
  cloud: new THREE.MeshStandardMaterial({ color: 0xf4f6ff, roughness: 0.92, metalness: 0.01 }),
};

function makeCharacter(primary, secondary) {
  const character = new THREE.Group();

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.2, 8, 18), primary);
  body.castShadow = true;
  body.position.y = 1.3;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.58, 28, 28), secondary);
  head.position.y = 2.45;
  head.castShadow = true;

  const eyeGeo = new THREE.SphereGeometry(0.09, 16, 16);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x121c2f, roughness: 0.15 });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.2, 2.5, 0.5);
  eyeR.position.set(0.2, 2.5, 0.5);

  const armGeo = new THREE.CapsuleGeometry(0.12, 0.75, 6, 8);
  const armL = new THREE.Mesh(armGeo, secondary);
  const armR = new THREE.Mesh(armGeo, secondary);
  armL.position.set(-0.62, 1.5, 0);
  armR.position.set(0.62, 1.5, 0);
  armL.rotation.z = -0.6;
  armR.rotation.z = 0.6;
  armL.castShadow = true;
  armR.castShadow = true;

  character.add(body, head, eyeL, eyeR, armL, armR);
  character.userData.arms = [armL, armR];
  character.userData.head = head;
  return character;
}

function makeCloud(position) {
  const group = new THREE.Group();
  const puffGeo = new THREE.SphereGeometry(0.8, 16, 16);
  const offsets = [
    [-1, 0, 0],
    [0, 0.4, 0.3],
    [1, 0.1, -0.2],
    [0.1, -0.2, -0.7],
  ];

  offsets.forEach(([x, y, z]) => {
    const puff = new THREE.Mesh(puffGeo, mat.cloud);
    puff.position.set(x, y, z);
    puff.castShadow = true;
    group.add(puff);
  });

  group.position.copy(position);
  return group;
}

function clearStory() {
  while (storyRoot.children.length) {
    const child = storyRoot.children.pop();
    child.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose?.();
    });
  }
}

const storyOptions = [
  {
    key: '1',
    name: 'Toy Rescue Rocket',
    description:
      'Tiny toy heroes build a rocket and launch to rescue a lost teddy on a moon made of cookies.',
    setup() {
      const hero = makeCharacter(mat.hero, mat.accent);
      hero.position.set(-3.6, 0, 0);

      const buddy = makeCharacter(mat.friend, mat.cloud);
      buddy.position.set(0.4, 0, -1.5);

      const rocket = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.75, 3.3, 24), mat.prop);
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.58, 1.4, 24), mat.accent);
      nose.position.y = 2.35;
      const finGeo = new THREE.BoxGeometry(0.15, 0.8, 0.9);
      for (let i = 0; i < 3; i += 1) {
        const fin = new THREE.Mesh(finGeo, mat.hero);
        fin.position.set(Math.cos((i * Math.PI * 2) / 3) * 0.65, -1.2, Math.sin((i * Math.PI * 2) / 3) * 0.65);
        fin.lookAt(0, -1.2, 0);
        rocket.add(fin);
      }
      rocket.add(body, nose);
      rocket.position.set(3.5, 1.6, 0.5);
      rocket.traverse((o) => (o.castShadow = true));

      storyRoot.add(hero, buddy, rocket);
      return (t) => {
        hero.position.x = -3.6 + Math.sin(t * 1.2) * 0.8;
        hero.position.y = Math.max(0, Math.sin(t * 2.6) * 0.25);
        buddy.position.z = -1.5 + Math.sin(t * 1.1 + 2) * 0.9;
        buddy.userData.arms[0].rotation.z = -0.7 + Math.sin(t * 4) * 0.3;
        buddy.userData.arms[1].rotation.z = 0.7 - Math.sin(t * 4) * 0.3;

        rocket.position.y = 1.6 + Math.sin(t * 3.2) * 0.15 + Math.max(0, Math.sin((t - 7) * 1.7)) * 6;
        rocket.rotation.z = Math.sin(t * 1.4) * 0.08;
      };
    },
  },
  {
    key: '2',
    name: 'Ocean Lantern Parade',
    description:
      'Inspired by underwater adventures: glowing sea pals dance around a magical lantern whale.',
    setup() {
      const whale = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(2.1, 28, 28), mat.friend);
      body.scale.set(1.5, 0.85, 0.9);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.8, 20), mat.friend);
      tail.position.set(-3.1, 0.1, 0);
      tail.rotation.z = Math.PI / 2;
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), mat.accent);
      lantern.position.set(1.8, 0.7, 0);
      lantern.material = lantern.material.clone();
      whale.add(body, tail, lantern);
      whale.position.y = 3;
      whale.traverse((o) => (o.castShadow = true));

      const fish = [...Array(12)].map((_, i) => {
        const f = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 14), i % 2 ? mat.hero : mat.cloud);
        f.castShadow = true;
        storyRoot.add(f);
        return f;
      });

      storyRoot.add(whale);
      return (t) => {
        whale.position.y = 3 + Math.sin(t * 1.7) * 0.35;
        whale.rotation.y = Math.sin(t * 0.45) * 0.45;
        lantern.material.emissive = new THREE.Color(0xffb238);
        lantern.material.emissiveIntensity = 1.1 + Math.sin(t * 6) * 0.5;

        fish.forEach((f, i) => {
          const ring = 2.8 + (i % 3) * 0.8;
          const angle = t * (0.55 + i * 0.02) + i;
          f.position.set(Math.cos(angle) * ring, 1 + Math.sin(t * 2 + i) * 0.6, Math.sin(angle) * ring);
        });
      };
    },
  },
  {
    key: '3',
    name: 'Cloud Kingdom Race',
    description:
      'A sky race above cotton candy clouds where brave kids surf rainbow winds to save the kingdom bell.',
    setup() {
      const rider = makeCharacter(mat.accent, mat.hero);
      rider.position.y = 3;

      const board = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, 0.7), mat.prop);
      board.position.y = 2.4;
      board.castShadow = true;

      const clouds = [
        makeCloud(new THREE.Vector3(-5, 2, -3)),
        makeCloud(new THREE.Vector3(4, 3, 2)),
        makeCloud(new THREE.Vector3(0, 4.8, -5)),
      ];

      const bell = new THREE.Mesh(new THREE.TorusKnotGeometry(0.55, 0.17, 90, 14), mat.accent);
      bell.position.set(4.5, 5, 0);
      bell.castShadow = true;

      storyRoot.add(rider, board, bell, ...clouds);
      return (t) => {
        rider.position.set(Math.sin(t * 1.1) * 4.2, 3 + Math.cos(t * 2.1) * 0.5, Math.cos(t * 0.9) * 4);
        rider.rotation.y = -t * 1.1;
        rider.userData.head.rotation.y = Math.sin(t * 2.4) * 0.3;

        board.position.copy(rider.position).add(new THREE.Vector3(0, -0.55, 0));
        board.rotation.set(0.18 * Math.sin(t * 1.8), -t * 1.1, 0.12 * Math.cos(t * 2.1));

        bell.rotation.x = t * 1.4;
        bell.rotation.y = t * 2.1;
        bell.position.y = 5 + Math.sin(t * 3) * 0.25;

        clouds.forEach((cloud, i) => {
          cloud.position.x += Math.sin(t * 0.3 + i) * 0.009;
          cloud.rotation.y = t * 0.06 * (i + 1);
        });
      };
    },
  },
  {
    key: '4',
    name: 'Forest Firefly Quest',
    description:
      'Inspired by fairy-tale woods: siblings follow dancing fireflies to unlock a glowing tree-heart.',
    setup() {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 4.8, 24), mat.prop);
      trunk.position.y = 2.4;
      trunk.castShadow = true;

      const crown = new THREE.Mesh(new THREE.SphereGeometry(3, 28, 28), mat.leaf);
      crown.position.y = 5.5;
      crown.castShadow = true;

      const heart = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65, 0), mat.accent);
      heart.position.y = 4.8;
      heart.material = heart.material.clone();
      heart.castShadow = true;

      const kidA = makeCharacter(mat.hero, mat.cloud);
      kidA.position.set(-2.8, 0, 1.7);
      const kidB = makeCharacter(mat.friend, mat.accent);
      kidB.position.set(2.8, 0, -1.7);

      storyRoot.add(trunk, crown, heart, kidA, kidB);

      return (t) => {
        heart.rotation.x = t * 1.4;
        heart.rotation.y = t * 1.9;
        heart.scale.setScalar(1 + Math.sin(t * 5) * 0.12);
        heart.material.emissive = new THREE.Color(0xffbe5f);
        heart.material.emissiveIntensity = 0.9 + Math.sin(t * 4) * 0.5;

        kidA.position.x = -2.8 + Math.sin(t * 1.8) * 0.8;
        kidB.position.x = 2.8 + Math.sin(t * 1.6 + 1) * 0.8;
        kidA.userData.arms[0].rotation.z = -0.6 + Math.sin(t * 4) * 0.4;
        kidB.userData.arms[1].rotation.z = 0.6 + Math.sin(t * 4.2) * 0.4;
      };
    },
  },
  {
    key: '5',
    name: 'Space Library Guardians',
    description:
      'Book-loving explorers jump between floating planets to save a story crystal and restore imagination.',
    setup() {
      const guardian = makeCharacter(mat.cloud, mat.friend);
      guardian.position.set(0, 0, 0);

      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0), mat.accent);
      crystal.position.set(0, 5, 0);
      crystal.castShadow = true;

      const planets = [...Array(5)].map((_, i) => {
        const p = new THREE.Mesh(
          new THREE.SphereGeometry(0.9 + i * 0.28, 24, 24),
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(`hsl(${(i * 72 + 40) % 360}, 68%, 63%)`),
            roughness: 0.62,
            metalness: 0.06,
          })
        );
        p.castShadow = true;
        storyRoot.add(p);
        return p;
      });

      storyRoot.add(guardian, crystal);
      return (t) => {
        guardian.position.y = Math.max(0, Math.sin(t * 3.3) * 0.5);
        guardian.rotation.y = Math.sin(t * 1.4) * 0.8;

        crystal.rotation.x = t * 1.7;
        crystal.rotation.y = t * 1.2;
        crystal.position.y = 5 + Math.sin(t * 2.6) * 0.9;

        planets.forEach((p, i) => {
          const radius = 3.2 + i * 1.35;
          const angle = t * (0.35 + i * 0.08) + i;
          p.position.set(Math.cos(angle) * radius, 2.4 + Math.sin(t * 1.5 + i) * 1.2, Math.sin(angle) * radius);
        });
      };
    },
  },
];

let activeAnimator = () => {};

function setStory(index) {
  const selected = storyOptions[index];
  clearStory();
  activeAnimator = selected.setup();

  descriptionEl.textContent = `${selected.name}: ${selected.description}`;
  [...controlsEl.children].forEach((btn, i) => btn.classList.toggle('active', i === index));
  selectEl.value = String(index);
}

storyOptions.forEach((story, index) => {
  const button = document.createElement('button');
  button.className = 'story-button';
  button.textContent = `${story.key}. ${story.name}`;
  button.addEventListener('click', () => setStory(index));
  controlsEl.append(button);
});


storyOptions.forEach((story, index) => {
  const option = document.createElement('option');
  option.value = String(index);
  option.textContent = `${story.key}. ${story.name}`;
  selectEl.append(option);
});

selectEl.addEventListener('change', (event) => {
  const index = Number(event.target.value);
  if (!Number.isNaN(index)) setStory(index);
});

setStory(0);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();

  activeAnimator(t);
  orbit.update();

  stars.rotation.y = t * 0.01;

  const { positions, base, geometry } = particleSystem;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = base[i] + Math.sin(t * 1.6 + base[i + 2]) * 0.35;
    positions[i + 1] = base[i + 1] + Math.sin(t * 2.4 + base[i]) * 0.2;
    positions[i + 2] = base[i + 2] + Math.cos(t * 1.2 + base[i]) * 0.35;
  }
  geometry.attributes.position.needsUpdate = true;

  ground.material.emissiveIntensity = 0.2 + Math.sin(t * 1.3) * 0.05;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
