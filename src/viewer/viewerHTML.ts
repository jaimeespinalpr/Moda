export const VIEWER_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
  canvas { display: block; touch-action: none; }
</style>
</head>
<body>
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/"
  }
}
</script>
<script type="module">
import * as THREE from 'three';

// ─── Scene ───────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111318);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.4, 5.5);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Lighting ────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xfff5e4, 0.6));

const key = new THREE.DirectionalLight(0xfff5dc, 2.8);
key.position.set(3, 6, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.1;
key.shadow.camera.far = 30;
key.shadow.camera.left = -5;
key.shadow.camera.right = 5;
key.shadow.camera.top = 8;
key.shadow.camera.bottom = -5;
key.shadow.bias = -0.001;
scene.add(key);

const fill = new THREE.DirectionalLight(0xd0e8ff, 1.0);
fill.position.set(-4, 3, 2);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xffffff, 0.5);
rim.position.set(0, -2, -4);
scene.add(rim);

const top = new THREE.DirectionalLight(0xfff0cc, 0.4);
top.position.set(0, 8, 0);
scene.add(top);

// ─── Floor (subtle) ──────────────────────────────────────────────────────────
const floorGeo = new THREE.PlaneGeometry(12, 12);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.9, metalness: 0.1 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.8;
floor.receiveShadow = true;
scene.add(floor);

// ─── Fabric Texture Generator ─────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return {r, g, b};
}

function darken(hex, factor) {
  const {r,g,b} = hexToRgb(hex);
  return \`rgb(\${Math.round(r*factor)},\${Math.round(g*factor)},\${Math.round(b*factor)})\`;
}

function lighten(hex, factor) {
  const {r,g,b} = hexToRgb(hex);
  return \`rgb(\${Math.min(255,Math.round(r+(255-r)*factor))},\${Math.min(255,Math.round(g+(255-g)*factor))},\${Math.min(255,Math.round(b+(255-b)*factor))})\`;
}

function createFabricTexture(fabricId, color) {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  switch(fabricId) {
    case 'cotton': {
      ctx.globalAlpha = 0.12;
      for (let i = 0; i < size; i += 4) {
        ctx.strokeStyle = darken(color, 0.7);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
      }
      ctx.globalAlpha = 0.06;
      for (let i = 0; i < size; i += 8) {
        ctx.strokeStyle = lighten(color, 0.3);
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(i+2, 0); ctx.lineTo(i+2, size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i+2); ctx.lineTo(size, i+2); ctx.stroke();
      }
      break;
    }
    case 'denim': {
      ctx.globalAlpha = 0.18;
      for (let i = -size; i < size*2; i += 5) {
        ctx.strokeStyle = darken(color, 0.6);
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + size, size); ctx.stroke();
      }
      ctx.globalAlpha = 0.07;
      for (let i = -size; i < size*2; i += 10) {
        ctx.strokeStyle = lighten(color, 0.4);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + size, size); ctx.stroke();
      }
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < size; i += 2) {
        for (let j = 0; j < size; j += 2) {
          if (Math.random() > 0.6) {
            ctx.fillStyle = lighten(color, 0.2);
            ctx.fillRect(i, j, 1, 1);
          }
        }
      }
      break;
    }
    case 'linen': {
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < size; i += 3) {
        ctx.strokeStyle = i%6===0 ? darken(color, 0.65) : lighten(color, 0.25);
        ctx.lineWidth = i%6===0 ? 1.5 : 0.8;
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
      }
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < size; i += 6) {
        ctx.strokeStyle = darken(color, 0.7);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
      }
      break;
    }
    case 'silk': {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, color);
      grad.addColorStop(0.3, lighten(color, 0.45));
      grad.addColorStop(0.5, color);
      grad.addColorStop(0.7, lighten(color, 0.3));
      grad.addColorStop(1, color);
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      ctx.globalAlpha = 0.06;
      for (let i = -size; i < size*2; i += 8) {
        ctx.strokeStyle = lighten(color, 0.6);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i+size, size); ctx.stroke();
      }
      break;
    }
    case 'polyester': {
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < size; i += 2) {
        ctx.strokeStyle = darken(color, 0.75);
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
      }
      const sheen = ctx.createLinearGradient(0, 0, size*0.7, size*0.7);
      sheen.addColorStop(0, 'rgba(255,255,255,0.08)');
      sheen.addColorStop(0.5, 'rgba(255,255,255,0.0)');
      sheen.addColorStop(1, 'rgba(255,255,255,0.04)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, size, size);
      break;
    }
    case 'velvet': {
      for (let i = 0; i < 60000; i++) {
        const x = Math.random()*size, y = Math.random()*size;
        const bright = Math.random();
        ctx.globalAlpha = bright * 0.12;
        ctx.fillStyle = bright > 0.5 ? lighten(color, 0.35) : darken(color, 0.5);
        ctx.fillRect(x, y, 1.2, 1.2);
      }
      ctx.globalAlpha = 0.04;
      for (let i = 0; i < size; i += 3) {
        ctx.strokeStyle = lighten(color, 0.6);
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
      }
      break;
    }
    case 'leather': {
      for (let i = 0; i < 8000; i++) {
        const x = Math.random()*size, y = Math.random()*size;
        ctx.globalAlpha = Math.random()*0.07;
        ctx.fillStyle = Math.random()>0.5 ? darken(color,0.6) : lighten(color,0.15);
        const s = Math.random()*3+1;
        ctx.beginPath();
        ctx.ellipse(x, y, s, s*0.4, Math.random()*Math.PI, 0, Math.PI*2);
        ctx.fill();
      }
      const sh = ctx.createLinearGradient(0,0,size*0.6,size*0.4);
      sh.addColorStop(0,'rgba(255,255,255,0.12)');
      sh.addColorStop(1,'rgba(255,255,255,0.0)');
      ctx.globalAlpha = 1; ctx.fillStyle = sh;
      ctx.fillRect(0,0,size,size);
      break;
    }
    case 'flannel': {
      const colors2 = [darken(color,0.6), lighten(color,0.3), darken(color,0.8)];
      const stripe = 32;
      for (let i = 0; i < size; i += stripe) {
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = colors2[Math.floor(i/stripe)%3];
        ctx.fillRect(i, 0, stripe, size);
      }
      for (let i = 0; i < size; i += stripe) {
        ctx.globalAlpha = 0.14;
        ctx.fillStyle = colors2[Math.floor(i/stripe)%3];
        ctx.fillRect(0, i, size, stripe);
      }
      ctx.globalAlpha = 0.07;
      for (let i = 0; i < size; i += 4) {
        ctx.strokeStyle = darken(color, 0.7);
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(size,i); ctx.stroke();
      }
      break;
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

function createNormalMap(fabricId) {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const d = img.data;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let nx = 128, ny = 128, nz = 255;
      switch(fabricId) {
        case 'cotton': {
          const wave = Math.sin(i*0.8)*12 + Math.sin(j*0.8)*12;
          nx = 128 + wave; ny = 128 + wave; break;
        }
        case 'denim': {
          const d2 = Math.sin((i+j)*0.4)*18;
          nx = 128+d2; ny = 128+d2*0.5; break;
        }
        case 'linen': {
          nx = 128+Math.sin(j*1.0)*16;
          ny = 128+Math.sin(i*1.6)*10; break;
        }
        case 'silk': { nx=128; ny=128; nz=255; break; }
        case 'velvet': {
          nx = 128+(Math.random()-0.5)*20;
          ny = 128+(Math.random()-0.5)*20; break;
        }
        case 'leather': {
          nx = 128+(Math.sin(i*0.3+j*0.1))*14;
          ny = 128+(Math.sin(j*0.3+i*0.1))*14; break;
        }
        case 'flannel': {
          nx = 128+Math.sin(i*0.5)*10+Math.sin(j*0.5)*10;
          ny = 128+Math.sin(i*0.5)*10+Math.sin(j*0.5)*10; break;
        }
      }
      const idx = (i*size+j)*4;
      d[idx]=Math.min(255,Math.max(0,nx));
      d[idx+1]=Math.min(255,Math.max(0,ny));
      d[idx+2]=nz; d[idx+3]=255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

function makeMaterial(fabricId, color, roughness, metalness) {
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
    map: createFabricTexture(fabricId, color),
    normalMap: createNormalMap(fabricId),
    normalScale: new THREE.Vector2(
      fabricId==='silk'||fabricId==='polyester' ? 0.15 :
      fabricId==='velvet' ? 0.5 : 0.4,
      fabricId==='silk'||fabricId==='polyester' ? 0.15 :
      fabricId==='velvet' ? 0.5 : 0.4
    ),
    envMapIntensity: fabricId==='silk'||fabricId==='leather' ? 0.9 : 0.3,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -4,
  });
  return mat;
}

// ─── Mannequin Body ───────────────────────────────────────────────────────────
function createMannequin() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xD9CFC4, roughness: 0.82, metalness: 0.04,
  });

  // Torso – single LatheGeometry from crotch to neck base
  // Position.y = -0.40 → local y 0 maps to world y -0.40
  const tp = [
    new THREE.Vector2(0.06, 0.00),   // crotch → world -0.40
    new THREE.Vector2(0.28, 0.20),   // hip curve → world -0.20
    new THREE.Vector2(0.30, 0.42),   // hip → world  0.02
    new THREE.Vector2(0.24, 0.90),   // waist → world  0.50
    new THREE.Vector2(0.26, 1.22),   // lower chest → world  0.82
    new THREE.Vector2(0.28, 1.60),   // chest → world  1.20
    new THREE.Vector2(0.26, 1.92),   // upper chest → world  1.52
    new THREE.Vector2(0.20, 2.22),   // shoulder → world  1.82
    new THREE.Vector2(0.13, 2.45),   // shoulder top → world  2.05
    new THREE.Vector2(0.10, 2.62),   // neck base → world  2.22
  ];
  const torso = new THREE.Mesh(new THREE.LatheGeometry(tp, 32), mat);
  torso.position.y = -0.40;
  torso.castShadow = true;
  g.add(torso);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.30, 16), mat);
  neck.position.y = 2.38;
  neck.castShadow = true;
  g.add(neck);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.20, 26, 18), mat);
  head.position.y = 2.75;
  head.castShadow = true;
  g.add(head);

  // Arms – upper
  const lArmU = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.070, 0.80, 14), mat);
  lArmU.position.set(-0.47, 1.72, 0);
  lArmU.rotation.z = 0.10;
  lArmU.castShadow = true;
  g.add(lArmU);
  const rArmU = lArmU.clone(); rArmU.position.x = 0.47; rArmU.rotation.z = -0.10; g.add(rArmU);

  // Arms – forearm
  const lArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.78, 14), mat);
  lArmL.position.set(-0.52, 0.96, 0);
  lArmL.rotation.z = 0.08;
  lArmL.castShadow = true;
  g.add(lArmL);
  const rArmL = lArmL.clone(); rArmL.position.x = 0.52; rArmL.rotation.z = -0.08; g.add(rArmL);

  // Hands
  const hGeo = new THREE.SphereGeometry(0.065, 10, 8);
  const lHand = new THREE.Mesh(hGeo, mat); lHand.position.set(-0.55, 0.55, 0); g.add(lHand);
  const rHand = lHand.clone(); rHand.position.x = 0.55; g.add(rHand);

  // Legs – thigh
  const lLegU = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.115, 1.05, 16), mat);
  lLegU.position.set(-0.19, -0.90, 0);
  lLegU.castShadow = true;
  g.add(lLegU);
  const rLegU = lLegU.clone(); rLegU.position.x = 0.19; g.add(rLegU);

  // Legs – calf
  const lLegL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 1.05, 16), mat);
  lLegL.position.set(-0.19, -1.95, 0);
  lLegL.castShadow = true;
  g.add(lLegL);
  const rLegL = lLegL.clone(); rLegL.position.x = 0.19; g.add(rLegL);

  // Feet
  const fGeo = new THREE.BoxGeometry(0.14, 0.08, 0.30);
  const lFoot = new THREE.Mesh(fGeo, mat); lFoot.position.set(-0.19, -2.51, 0.06); lFoot.castShadow = true; g.add(lFoot);
  const rFoot = lFoot.clone(); rFoot.position.x = 0.19; g.add(rFoot);

  return g;
}

// ─── Shirt Geometry ───────────────────────────────────────────────────────────
function buildShirtShape(cutId) {
  const shape = new THREE.Shape();
  const bevel = { depth: 0.2, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.015, bevelSegments: 4 };

  const addNeck = (s, type) => {
    if (type === 'vneck') {
      const hole = new THREE.Path();
      hole.moveTo(-0.18, 0.98);
      hole.lineTo(0, 0.52);
      hole.lineTo(0.18, 0.98);
      hole.quadraticCurveTo(0, 1.05, -0.18, 0.98);
      s.holes.push(hole);
    } else if (type === 'buttonup') {
      const hole = new THREE.Path();
      hole.moveTo(-0.12, 1.08);
      hole.lineTo(-0.08, 0.88);
      hole.lineTo(0.08, 0.88);
      hole.lineTo(0.12, 1.08);
      hole.quadraticCurveTo(0, 1.14, -0.12, 1.08);
      s.holes.push(hole);
    } else if (type === 'polo') {
      const hole = new THREE.Path();
      hole.absellipse(0, 1.0, 0.13, 0.1, 0, Math.PI*2);
      s.holes.push(hole);
    } else {
      const hole = new THREE.Path();
      hole.absellipse(0, 0.92, 0.22, 0.18, 0, Math.PI*2);
      s.holes.push(hole);
    }
  };

  switch(cutId) {
    case 'tshirt':
    case 'vneck':
    case 'polo': {
      shape.moveTo(-0.68,-1.08); shape.lineTo(0.68,-1.08);
      shape.lineTo(0.68,0.48); shape.lineTo(0.82,0.5);
      shape.quadraticCurveTo(1.28,0.62,1.42,0.5);
      shape.lineTo(1.28,0.9); shape.lineTo(1.12,0.96);
      shape.lineTo(0.62,0.85); shape.quadraticCurveTo(0.38,1.08,0.22,1.12);
      shape.lineTo(-0.22,1.12); shape.quadraticCurveTo(-0.38,1.08,-0.62,0.85);
      shape.lineTo(-1.12,0.96); shape.lineTo(-1.28,0.9);
      shape.lineTo(-1.42,0.5); shape.quadraticCurveTo(-1.28,0.62,-0.82,0.5);
      shape.lineTo(-0.68,0.48); shape.lineTo(-0.68,-1.08);
      addNeck(shape, cutId);
      if (cutId==='polo') {
        const collar = new THREE.Path();
        collar.moveTo(-0.14,1.1); collar.lineTo(0.14,1.1);
        collar.lineTo(0.16,1.22); collar.lineTo(-0.16,1.22);
        collar.lineTo(-0.14,1.1);
        shape.holes.push(collar);
      }
      break;
    }
    case 'longsleeve': {
      shape.moveTo(-0.68,-1.08); shape.lineTo(0.68,-1.08);
      shape.lineTo(0.68,0.48); shape.lineTo(0.72,0.5);
      shape.lineTo(0.72,-0.9); shape.lineTo(1.2,-0.9);
      shape.lineTo(1.22,0.52); shape.quadraticCurveTo(1.15,0.86,0.62,0.88);
      shape.lineTo(-0.62,0.88); shape.quadraticCurveTo(-1.15,0.86,-1.22,0.52);
      shape.lineTo(-1.2,-0.9); shape.lineTo(-0.72,-0.9);
      shape.lineTo(-0.72,0.5); shape.lineTo(-0.68,0.48);
      shape.lineTo(-0.68,-1.08);
      addNeck(shape, 'tshirt');
      break;
    }
    case 'buttonup': {
      shape.moveTo(-0.66,-1.08); shape.lineTo(0.66,-1.08);
      shape.lineTo(0.66,0.46); shape.lineTo(0.7,0.48);
      shape.lineTo(0.7,-0.88); shape.lineTo(1.18,-0.88);
      shape.lineTo(1.2,0.5); shape.quadraticCurveTo(1.1,0.92,0.58,0.98);
      shape.lineTo(0.2,1.0); shape.lineTo(0.2,1.18);
      shape.lineTo(0.16,1.28); shape.lineTo(-0.16,1.28);
      shape.lineTo(-0.2,1.18); shape.lineTo(-0.2,1.0);
      shape.lineTo(-0.58,0.98); shape.quadraticCurveTo(-1.1,0.92,-1.2,0.5);
      shape.lineTo(-1.18,-0.88); shape.lineTo(-0.7,-0.88);
      shape.lineTo(-0.7,0.48); shape.lineTo(-0.66,0.46);
      shape.lineTo(-0.66,-1.08);
      const btn1 = new THREE.Path(); btn1.absarc(0,-0.1,0.04,0,Math.PI*2); shape.holes.push(btn1);
      const btn2 = new THREE.Path(); btn2.absarc(0,-0.45,0.04,0,Math.PI*2); shape.holes.push(btn2);
      const btn3 = new THREE.Path(); btn3.absarc(0,-0.8,0.04,0,Math.PI*2); shape.holes.push(btn3);
      break;
    }
    case 'sleeveless': {
      shape.moveTo(-0.6,-1.08); shape.lineTo(0.6,-1.08);
      shape.lineTo(0.6,0.6); shape.quadraticCurveTo(0.6,1.1,0.3,1.15);
      shape.lineTo(0.18,1.15); shape.quadraticCurveTo(0.05,1.0,0,0.98);
      shape.quadraticCurveTo(-0.05,1.0,-0.18,1.15);
      shape.lineTo(-0.3,1.15); shape.quadraticCurveTo(-0.6,1.1,-0.6,0.6);
      shape.lineTo(-0.6,-1.08);
      const nh = new THREE.Path(); nh.absellipse(0,0.92,0.18,0.15,0,Math.PI*2);
      shape.holes.push(nh);
      break;
    }
    case 'crop': {
      shape.moveTo(-0.68,-0.18); shape.lineTo(0.68,-0.18);
      shape.lineTo(0.68,0.48); shape.lineTo(0.82,0.5);
      shape.quadraticCurveTo(1.28,0.62,1.42,0.5);
      shape.lineTo(1.28,0.9); shape.lineTo(1.12,0.96);
      shape.lineTo(0.62,0.85); shape.quadraticCurveTo(0.38,1.08,0.22,1.12);
      shape.lineTo(-0.22,1.12); shape.quadraticCurveTo(-0.38,1.08,-0.62,0.85);
      shape.lineTo(-1.12,0.96); shape.lineTo(-1.28,0.9);
      shape.lineTo(-1.42,0.5); shape.quadraticCurveTo(-1.28,0.62,-0.82,0.5);
      shape.lineTo(-0.68,0.48); shape.lineTo(-0.68,-0.18);
      addNeck(shape, 'tshirt');
      break;
    }
    case 'hoodie': {
      shape.moveTo(-0.75,-1.08); shape.lineTo(0.75,-1.08);
      shape.lineTo(0.75,0.46); shape.lineTo(0.8,0.48);
      shape.lineTo(0.8,-0.9); shape.lineTo(1.22,-0.9);
      shape.lineTo(1.25,0.52); shape.quadraticCurveTo(1.1,0.92,0.7,0.98);
      shape.lineTo(0.72,0.98); shape.quadraticCurveTo(0.65,1.28,0.4,1.5);
      shape.lineTo(0.2,1.6); shape.quadraticCurveTo(0,1.68,-0.2,1.6);
      shape.lineTo(-0.4,1.5); shape.quadraticCurveTo(-0.65,1.28,-0.72,0.98);
      shape.lineTo(-0.7,0.98); shape.quadraticCurveTo(-1.1,0.92,-1.25,0.52);
      shape.lineTo(-1.22,-0.9); shape.lineTo(-0.8,-0.9);
      shape.lineTo(-0.8,0.48); shape.lineTo(-0.75,0.46);
      shape.lineTo(-0.75,-1.08);
      const hoodHole = new THREE.Path(); hoodHole.absellipse(0,0.95,0.28,0.22,0,Math.PI*2);
      shape.holes.push(hoodHole);
      const pocket = new THREE.Path();
      pocket.moveTo(-0.35,-0.35); pocket.lineTo(0.35,-0.35);
      pocket.lineTo(0.35,-0.6); pocket.lineTo(-0.35,-0.6); pocket.lineTo(-0.35,-0.35);
      shape.holes.push(pocket);
      break;
    }
    default: {
      shape.moveTo(-0.68,-1.08); shape.lineTo(0.68,-1.08);
      shape.lineTo(0.68,0.48); shape.lineTo(0.82,0.5);
      shape.quadraticCurveTo(1.28,0.62,1.42,0.5);
      shape.lineTo(1.28,0.9); shape.lineTo(1.12,0.96);
      shape.lineTo(0.62,0.85); shape.quadraticCurveTo(0.38,1.08,0.22,1.12);
      shape.lineTo(-0.22,1.12); shape.quadraticCurveTo(-0.38,1.08,-0.62,0.85);
      shape.lineTo(-1.12,0.96); shape.lineTo(-1.28,0.9);
      shape.lineTo(-1.42,0.5); shape.quadraticCurveTo(-1.28,0.62,-0.82,0.5);
      shape.lineTo(-0.68,0.48); shape.lineTo(-0.68,-1.08);
      addNeck(shape, 'tshirt');
    }
  }
  return new THREE.ExtrudeGeometry(shape, bevel);
}

// ─── Pants Geometry ───────────────────────────────────────────────────────────
function buildPantsShape(cutId) {
  const bevel = { depth: 0.22, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.01, bevelSegments: 3 };
  const shape = new THREE.Shape();

  const cuts = {
    skinny:   { top: 0.35, bot: 0.18, hem: -1.15, gap: 0.08 },
    straight: { top: 0.38, bot: 0.38, hem: -1.15, gap: 0.08 },
    widel:    { top: 0.42, bot: 0.64, hem: -1.15, gap: 0.1  },
    bootcut:  { top: 0.36, bot: 0.5,  hem: -1.15, gap: 0.08 },
    cargo:    { top: 0.4,  bot: 0.4,  hem: -1.15, gap: 0.1  },
    dress:    { top: 0.36, bot: 0.32, hem: -1.15, gap: 0.07 },
    jogger:   { top: 0.44, bot: 0.22, hem: -1.12, gap: 0.1  },
    shorts:   { top: 0.4,  bot: 0.44, hem: -0.22, gap: 0.1  },
  };
  const p = cuts[cutId] || cuts.straight;

  // Waistband
  const ww = 0.72;
  shape.moveTo(-ww, 1.08); shape.lineTo(ww, 1.08);
  // Right side down to leg
  shape.lineTo(ww, 0.82);
  shape.quadraticCurveTo(ww+0.06, 0.55, p.top+p.gap, 0.48);
  // Right leg
  shape.lineTo(p.bot+p.gap, p.hem);
  // Crotch
  shape.lineTo(p.gap*0.3, p.hem);
  shape.quadraticCurveTo(0, -0.4, -p.gap*0.3, p.hem);
  // Left leg
  shape.lineTo(-p.bot-p.gap, p.hem);
  shape.lineTo(-p.top-p.gap, 0.48);
  shape.quadraticCurveTo(-ww-0.06, 0.55, -ww, 0.82);
  shape.lineTo(-ww, 1.08);

  // Waistband detail
  const waist = new THREE.Path();
  waist.moveTo(-(ww-0.04), 1.04); waist.lineTo(ww-0.04, 1.04);
  waist.lineTo(ww-0.04, 0.86); waist.lineTo(-(ww-0.04), 0.86); waist.lineTo(-(ww-0.04), 1.04);
  shape.holes.push(waist);

  // Cargo pockets
  if (cutId === 'cargo') {
    const lp = new THREE.Path();
    lp.moveTo(-(p.top+p.gap+0.08), 0.1); lp.lineTo(-(p.top+p.gap+0.08), -0.32);
    lp.lineTo(-(p.gap+0.04), -0.32); lp.lineTo(-(p.gap+0.04), 0.1); lp.lineTo(-(p.top+p.gap+0.08), 0.1);
    shape.holes.push(lp);
    const rp = new THREE.Path();
    rp.moveTo(p.top+p.gap+0.08, 0.1); rp.lineTo(p.top+p.gap+0.08, -0.32);
    rp.lineTo(p.gap+0.04, -0.32); rp.lineTo(p.gap+0.04, 0.1); rp.lineTo(p.top+p.gap+0.08, 0.1);
    shape.holes.push(rp);
  }

  return new THREE.ExtrudeGeometry(shape, bevel);
}

// ─── State & Meshes ───────────────────────────────────────────────────────────
const FABRIC_PROPS = {
  cotton:    { roughness: 0.85, metalness: 0.0  },
  denim:     { roughness: 0.92, metalness: 0.0  },
  linen:     { roughness: 0.95, metalness: 0.0  },
  silk:      { roughness: 0.08, metalness: 0.15 },
  polyester: { roughness: 0.60, metalness: 0.05 },
  velvet:    { roughness: 1.00, metalness: 0.0  },
  leather:   { roughness: 0.30, metalness: 0.10 },
  flannel:   { roughness: 0.98, metalness: 0.0  },
};

let state = {
  shirtCutId: 'tshirt',
  pantsCutId: 'straight',
  shirtFabricId: 'cotton',
  pantsFabricId: 'denim',
  shirtColor: '#FFFFFF',
  pantsColor: '#1A237E',
  showShirt: true,
  showPants: true,
  showMannequin: true,
};

let shirtMesh = null;
let pantsMesh = null;
const shirtGroup = new THREE.Group();
const pantsGroup = new THREE.Group();
shirtGroup.position.y = 1.1;
pantsGroup.position.y = -1.25;
scene.add(shirtGroup);
scene.add(pantsGroup);

function buildShirt() {
  if (shirtMesh) { shirtGroup.remove(shirtMesh); shirtMesh.geometry.dispose(); shirtMesh.material.dispose(); }
  const geo = buildShirtShape(state.shirtCutId);
  geo.center();
  const fp = FABRIC_PROPS[state.shirtFabricId] || FABRIC_PROPS.cotton;
  const mat = makeMaterial(state.shirtFabricId, state.shirtColor, fp.roughness, fp.metalness);
  shirtMesh = new THREE.Mesh(geo, mat);
  shirtMesh.castShadow = true;
  shirtMesh.receiveShadow = true;
  shirtGroup.add(shirtMesh);
  shirtGroup.visible = state.showShirt;
}

function buildPants() {
  if (pantsMesh) { pantsGroup.remove(pantsMesh); pantsMesh.geometry.dispose(); pantsMesh.material.dispose(); }
  const geo = buildPantsShape(state.pantsCutId);
  geo.center();
  const fp = FABRIC_PROPS[state.pantsFabricId] || FABRIC_PROPS.denim;
  const mat = makeMaterial(state.pantsFabricId, state.pantsColor, fp.roughness, fp.metalness);
  pantsMesh = new THREE.Mesh(geo, mat);
  pantsMesh.castShadow = true;
  pantsMesh.receiveShadow = true;
  pantsGroup.add(pantsMesh);
  pantsGroup.visible = state.showPants;
}

buildShirt();
buildPants();

// ─── Touch Controls ───────────────────────────────────────────────────────────
let isDragging = false, lastX = 0, lastY = 0;
let rotX = 0.08, rotY = 0;
let pinchDist = 0;
let zoom = 5.5;
const targetGroup = new THREE.Group();
scene.add(targetGroup);
const mannequin = createMannequin();
targetGroup.add(mannequin);
targetGroup.add(shirtGroup);
targetGroup.add(pantsGroup);

const canvas = renderer.domElement;
canvas.addEventListener('pointerdown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
canvas.addEventListener('pointerup', () => { isDragging = false; });
canvas.addEventListener('pointermove', e => {
  if (!isDragging) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  rotY += dx * 0.008;
  rotX += dy * 0.005;
  rotX = Math.max(-0.5, Math.min(0.5, rotX));
  lastX = e.clientX; lastY = e.clientY;
});

canvas.addEventListener('touchstart', e => { if (e.touches.length===2) { pinchDist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); } }, {passive:true});
canvas.addEventListener('touchmove', e => {
  if (e.touches.length===2) {
    const d = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
    zoom += (pinchDist - d) * 0.02;
    zoom = Math.max(3, Math.min(10, zoom));
    pinchDist = d;
  }
}, {passive:true});

canvas.addEventListener('wheel', e => {
  zoom += e.deltaY * 0.01;
  zoom = Math.max(3, Math.min(10, zoom));
});

// ─── Message Handling ─────────────────────────────────────────────────────────
function applyState(msg) {
  let needShirt = false, needPants = false;
  if (msg.shirtCutId !== undefined && msg.shirtCutId !== state.shirtCutId) { state.shirtCutId = msg.shirtCutId; needShirt = true; }
  if (msg.pantsCutId !== undefined && msg.pantsCutId !== state.pantsCutId) { state.pantsCutId = msg.pantsCutId; needPants = true; }
  if (msg.shirtFabricId !== undefined && msg.shirtFabricId !== state.shirtFabricId) { state.shirtFabricId = msg.shirtFabricId; needShirt = true; }
  if (msg.pantsFabricId !== undefined && msg.pantsFabricId !== state.pantsFabricId) { state.pantsFabricId = msg.pantsFabricId; needPants = true; }
  if (msg.shirtColor !== undefined && msg.shirtColor !== state.shirtColor) { state.shirtColor = msg.shirtColor; needShirt = true; }
  if (msg.pantsColor !== undefined && msg.pantsColor !== state.pantsColor) { state.pantsColor = msg.pantsColor; needPants = true; }
  if (msg.showShirt !== undefined) { state.showShirt = msg.showShirt; if (shirtGroup) shirtGroup.visible = msg.showShirt; }
  if (msg.showPants !== undefined) { state.showPants = msg.showPants; if (pantsGroup) pantsGroup.visible = msg.showPants; }
  if (msg.showMannequin !== undefined) { state.showMannequin = msg.showMannequin; mannequin.visible = msg.showMannequin; }
  if (needShirt) buildShirt();
  if (needPants) buildPants();
}

function postToRN(obj) {
  try { window.ReactNativeWebView?.postMessage(JSON.stringify(obj)); } catch(_){}
}

window.addEventListener('message', e => {
  try {
    const msg = JSON.parse(e.data);
    if (msg.type === 'update') applyState(msg);
    if (msg.type === 'capture') {
      renderer.render(scene, camera);
      const base64 = renderer.domElement.toDataURL('image/png');
      postToRN({ type: 'capture', data: base64 });
    }
    if (msg.type === 'reset') { rotX = 0.08; rotY = 0; zoom = 5.5; }
  } catch(_){}
});

document.addEventListener('message', e => {
  try {
    const msg = JSON.parse(e.data);
    if (msg.type === 'update') applyState(msg);
    if (msg.type === 'capture') {
      renderer.render(scene, camera);
      const base64 = renderer.domElement.toDataURL('image/png');
      postToRN({ type: 'capture', data: base64 });
    }
  } catch(_){}
});

postToRN({ type: 'ready' });

// ─── Render Loop ──────────────────────────────────────────────────────────────
let autoRotate = true;
let autoT = 0;
canvas.addEventListener('pointerdown', () => { autoRotate = false; });

function animate() {
  requestAnimationFrame(animate);
  if (autoRotate) { autoT += 0.004; rotY = Math.sin(autoT) * 0.4; }
  targetGroup.rotation.y += (rotY - targetGroup.rotation.y) * 0.08;
  targetGroup.rotation.x += (rotX - targetGroup.rotation.x) * 0.08;
  camera.position.z += (zoom - camera.position.z) * 0.06;
  renderer.render(scene, camera);
}
animate();
</script>
</body>
</html>`;
