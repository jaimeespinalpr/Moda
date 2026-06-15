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
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

// ─── Scene ───────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
document.body.appendChild(renderer.domElement);

// ─── Environment map (studio room – makes ALL materials realistic) ─────────
RectAreaLightUniformsLib.init();
const pmremGen = new THREE.PMREMGenerator(renderer);
const envTex = pmremGen.fromScene(new RoomEnvironment(renderer), 0.02).texture;
scene.environment = envTex;
scene.background = new THREE.Color(0x0c0e14);
pmremGen.dispose();

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.3, 5.8);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Lighting (studio fashion setup) ─────────────────────────────────────────
// Very low ambient – environment handles diffuse ambient
scene.add(new THREE.AmbientLight(0xffffff, 0.08));

// Key light: large, warm, upper right
const key = new THREE.DirectionalLight(0xfff8f0, 4.2);
key.position.set(3.5, 7, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.1; key.shadow.camera.far = 30;
key.shadow.camera.left = -5; key.shadow.camera.right = 5;
key.shadow.camera.top = 9; key.shadow.camera.bottom = -5;
key.shadow.bias = -0.0006;
scene.add(key);

// Fill: cool, left – fills shadows softly
const fill = new THREE.DirectionalLight(0xc8d8ff, 1.6);
fill.position.set(-5, 3, 2);
scene.add(fill);

// Rim/kicker: warm backlight to separate subject from bg
const rim = new THREE.DirectionalLight(0xffecd4, 1.2);
rim.position.set(1, 5, -6);
scene.add(rim);

// Soft box lights (RectAreaLight) for studio softbox feel
const boxR = new THREE.RectAreaLight(0xfff5e4, 4, 3, 7);
boxR.position.set(4.5, 0.5, 3); boxR.lookAt(0, 0.5, 0);
scene.add(boxR);

const boxL = new THREE.RectAreaLight(0xe8eeff, 2, 2.5, 6);
boxL.position.set(-4.5, 0.5, 2); boxL.lookAt(0, 0.5, 0);
scene.add(boxL);

// ─── Floor ───────────────────────────────────────────────────────────────────
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(18, 18),
  new THREE.MeshStandardMaterial({ color: 0x14161e, roughness: 0.92, metalness: 0.08, envMapIntensity: 0.4 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.8;
floor.receiveShadow = true;
scene.add(floor);

// ─── Fabric Texture Generator (per-pixel realistic weave) ────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return {r, g, b};
}

function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }

function createFabricTexture(fabricId, color) {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const d = img.data;
  const {r, g, b} = hexToRgb(color);

  // Fill base color
  for (let i = 0; i < size * size * 4; i += 4) {
    d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = 255;
  }

  switch (fabricId) {
    case 'cotton': {
      const T = 7; // thread pitch in pixels
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const tx = Math.floor(x / T), ty = Math.floor(y / T);
        const px = (x % T) / T, py = (y % T) / T;
        const isWarp = (tx + ty) % 2 === 0;
        const tc = isWarp ? py : px;
        // Thread roundness highlight
        const hi = 0.78 + 0.22 * Math.sin(tc * Math.PI);
        // Shadow at crossovers
        const cross = Math.min(px, py, 1-px, 1-py) * 4;
        const sh = 0.82 + 0.18 * Math.pow(cross, 0.5);
        // Subtle per-thread color variation (natural fiber irregularity)
        const v = 0.94 + 0.06 * (((tx*127+ty*311)&255)/255);
        const f = hi * sh * v;
        const i2 = (y*size+x)*4;
        d[i2]=clamp(r*f); d[i2+1]=clamp(g*f); d[i2+2]=clamp(b*f);
      }
      break;
    }
    case 'denim': {
      const T = 5; // denim has tighter warp threads
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const tx = Math.floor(x / T), ty = Math.floor(y / T);
        const px = (x % T) / T, py = (y % T) / T;
        // 3×1 right-hand twill: weft floats every 4th crossing offset by row
        const twill = (tx * 3 + ty) % 4;
        const isWeft = twill === 0;
        const tc = isWeft ? py : px;
        const hi = 0.7 + 0.3 * Math.sin(tc * Math.PI);
        // Denim weft is much lighter (white-ish cotton)
        const weftLight = isWeft ? 1.6 : 1.0;
        const v = 0.9 + 0.1 * (((tx*73+ty*127)&255)/255);
        const f = hi * v;
        const i2 = (y*size+x)*4;
        d[i2]=clamp(r*f*weftLight); d[i2+1]=clamp(g*f*weftLight); d[i2+2]=clamp(b*f*weftLight);
      }
      break;
    }
    case 'linen': {
      const T = 11; // linen has thick, irregular threads
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const tx = Math.floor(x / T), ty = Math.floor(y / T);
        const px = (x % T) / T, py = (y % T) / T;
        const isWarp = (tx + ty) % 2 === 0;
        const tc = isWarp ? py : px;
        // Natural slub (thickness variation per thread)
        const slub = 0.85 + 0.15 * (((tx*37+ty*19)&15)/15);
        const hi = (0.68 + 0.32 * Math.sin(tc * Math.PI)) * slub;
        const i2 = (y*size+x)*4;
        d[i2]=clamp(r*hi); d[i2+1]=clamp(g*hi); d[i2+2]=clamp(b*hi);
      }
      break;
    }
    case 'silk': {
      // Satin weave: very smooth, strong directional sheen
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const i2 = (y*size+x)*4;
        // Multi-direction satin sheen
        const d1 = ((x*0.7 + y*0.3) % size) / size;
        const d2 = ((x*0.2 + y*0.8) % size) / size;
        const sheen = 0.55 + 0.35 * Math.pow(Math.sin(d1*Math.PI*1.5), 6)
                          + 0.1  * Math.pow(Math.sin(d2*Math.PI*2), 4);
        // Add highlight brightness
        const hi = Math.pow(sheen, 0.7);
        d[i2]=clamp(r*hi + 40*(sheen-0.55)); d[i2+1]=clamp(g*hi + 40*(sheen-0.55)); d[i2+2]=clamp(b*hi + 40*(sheen-0.55));
      }
      break;
    }
    case 'polyester': {
      const T = 3; // very fine synthetic threads
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const tx = Math.floor(x/T), ty = Math.floor(y/T);
        const px = (x%T)/T, py = (y%T)/T;
        const isWarp = (tx+ty)%2===0;
        const tc = isWarp ? py : px;
        const hi = 0.88 + 0.12 * Math.sin(tc*Math.PI);
        // Polyester micro-sheen
        const sh = 1.0 + 0.04 * Math.sin((x+y)*0.25);
        const i2=(y*size+x)*4;
        d[i2]=clamp(r*hi*sh); d[i2+1]=clamp(g*hi*sh); d[i2+2]=clamp(b*hi*sh);
      }
      break;
    }
    case 'velvet': {
      // Pile fabric – subtle variation (sheen is handled by MeshPhysicalMaterial)
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const i2=(y*size+x)*4;
        // Pile direction creates subtle horizontal streak
        const pile = 0.88 + 0.12 * Math.sin((y/size)*Math.PI*3 + x*0.02);
        // Fine noise for pile length variation
        const noise = (((x*7+y*13+x*y*3)&0xff)/255)*0.08;
        const f = pile + noise - 0.04;
        d[i2]=clamp(r*f); d[i2+1]=clamp(g*f); d[i2+2]=clamp(b*f);
      }
      break;
    }
    case 'leather': {
      // Voronoi grain + pores
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const i2=(y*size+x)*4;
        const gx=x/28, gy=y/28;
        const cx=Math.floor(gx), cy=Math.floor(gy);
        let minD=99;
        for (let di=-1;di<=1;di++) for (let dj=-1;dj<=1;dj++) {
          const sd=((cx+di)*73+(cy+dj)*127)&0xffff;
          const px=(cx+di)+(sd&255)/255, py=(cy+dj)+((sd>>8)&255)/255;
          const dist=Math.sqrt((gx-px)**2+(gy-py)**2);
          minD=Math.min(minD,dist);
        }
        const grain=Math.pow(minD,0.35);
        // Micro pores
        const pore=((x*1049+y*1571)&0xffff)>0xf800?0.72:1.0;
        // Surface sheen gradient
        const sheen=1.0+0.08*Math.pow(Math.sin((x+y*0.5)/size*Math.PI),2);
        const f=(0.72+0.28*grain)*pore*sheen;
        d[i2]=clamp(r*f); d[i2+1]=clamp(g*f); d[i2+2]=clamp(b*f);
      }
      break;
    }
    case 'flannel': {
      // Brushed twill + plaid
      const S1=48, S2=96;
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const i2=(y*size+x)*4;
        // Plaid pattern
        const hb=(Math.floor(x/S1))%3===1?0.78:1.0;
        const vb=(Math.floor(y/S2))%3===1?0.82:1.0;
        const cross=(Math.floor(x/S1))%3===1&&(Math.floor(y/S2))%3===1?0.65:Math.min(hb,vb);
        // Brushed softness noise
        const brush=0.92+0.08*(((x*3+y*7+x*y)&0xff)/255);
        const f=cross*brush;
        d[i2]=clamp(r*f); d[i2+1]=clamp(g*f); d[i2+2]=clamp(b*f);
      }
      break;
    }
  }

  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  tex.anisotropy = 8;
  return tex;
}

function createNormalMap(fabricId) {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const d = img.data;

  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i2 = (y*size+x)*4;
    let nx=128, ny=128;

    switch(fabricId) {
      case 'cotton': {
        const T=7;
        const px=(x%T)/T, py=(y%T)/T;
        const tx=Math.floor(x/T), ty=Math.floor(y/T);
        const isWarp=(tx+ty)%2===0;
        // Normal bends over each thread cylinder
        const tc=isWarp?py:px;
        const bump=Math.cos((tc-0.5)*Math.PI)*18;
        nx=clamp(128+(isWarp?0:bump)); ny=clamp(128+(isWarp?bump:0));
        break;
      }
      case 'denim': {
        const T=5;
        const tx=Math.floor(x/T), ty=Math.floor(y/T);
        const px=(x%T)/T, py=(y%T)/T;
        const twill=(tx*3+ty)%4; const isWeft=twill===0;
        const tc=isWeft?py:px;
        const bump=Math.cos((tc-0.5)*Math.PI)*22;
        // Diagonal direction normal
        const diag=Math.sin((x+y)*0.05)*8;
        nx=clamp(128+(isWeft?diag:bump)+diag*0.5);
        ny=clamp(128+(isWeft?bump:diag));
        break;
      }
      case 'linen': {
        const T=11; const px=(x%T)/T, py=(y%T)/T;
        const tx=Math.floor(x/T), ty=Math.floor(y/T);
        const isWarp=(tx+ty)%2===0; const tc=isWarp?py:px;
        const bump=Math.cos((tc-0.5)*Math.PI)*28; // linen has more pronounced texture
        nx=clamp(128+(isWarp?0:bump)); ny=clamp(128+(isWarp?bump:0));
        break;
      }
      case 'silk': { nx=128; ny=128; break; } // silk is flat/smooth
      case 'polyester': {
        // Fine regular grid
        const px=(x%3)/3, py=(y%3)/3;
        nx=clamp(128+Math.cos((px-0.5)*Math.PI)*8);
        ny=clamp(128+Math.cos((py-0.5)*Math.PI)*8);
        break;
      }
      case 'velvet': {
        // Soft random pile direction
        const seed=(x*7+y*11)&0xff;
        nx=clamp(128+(seed/255-0.5)*24);
        ny=clamp(128+Math.sin(y*0.3)*10);
        break;
      }
      case 'leather': {
        const gx=x/28, gy=y/28;
        const cx=Math.floor(gx), cy=Math.floor(gy);
        // Bumpy grain cells
        const smooth=(gx-cx)*(1-(gx-cx))*4;
        const smoothY=(gy-cy)*(1-(gy-cy))*4;
        nx=clamp(128+Math.sin(gx*Math.PI*2)*smooth*20);
        ny=clamp(128+Math.sin(gy*Math.PI*2)*smoothY*20);
        break;
      }
      case 'flannel': {
        const T=7; const px=(x%T)/T, py=(y%T)/T;
        const bump=Math.cos((px-0.5)*Math.PI)*10+Math.cos((py-0.5)*Math.PI)*10;
        nx=clamp(128+bump); ny=clamp(128+bump);
        break;
      }
      default: { nx=128; ny=128; }
    }
    d[i2]=nx; d[i2+1]=ny; d[i2+2]=255; d[i2+3]=255;
  }

  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  return tex;
}

// ─── Material factory (PBR + MeshPhysicalMaterial for velvet/silk/leather) ───
function makeMaterial(fabricId, color, roughness, metalness) {
  const base = {
    color: new THREE.Color(color),
    roughness, metalness,
    map: createFabricTexture(fabricId, color),
    normalMap: createNormalMap(fabricId),
    normalScale: new THREE.Vector2(
      fabricId==='silk' ? 0.05 :
      fabricId==='linen' ? 0.7 :
      fabricId==='leather' ? 0.55 :
      fabricId==='velvet' ? 0.35 : 0.45,
      fabricId==='silk' ? 0.05 :
      fabricId==='linen' ? 0.7 :
      fabricId==='leather' ? 0.55 :
      fabricId==='velvet' ? 0.35 : 0.45,
    ),
    envMapIntensity: fabricId==='silk'?1.4 : fabricId==='leather'?1.1 : fabricId==='polyester'?0.7 : 0.5,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4,
  };

  // Velvet: MeshPhysicalMaterial with sheen (characteristic cat-eye reflectance)
  if (fabricId === 'velvet') {
    return new THREE.MeshPhysicalMaterial({
      ...base,
      sheen: 1.0,
      sheenColor: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.4),
      sheenRoughness: 0.5,
    });
  }
  // Silk: sheen for that lustrous iridescent look
  if (fabricId === 'silk') {
    return new THREE.MeshPhysicalMaterial({
      ...base,
      sheen: 0.6,
      sheenColor: new THREE.Color(0xffffff),
      sheenRoughness: 0.15,
    });
  }
  // Leather: clearcoat for the polished surface finish
  if (fabricId === 'leather') {
    return new THREE.MeshPhysicalMaterial({
      ...base,
      clearcoat: 0.4,
      clearcoatRoughness: 0.25,
    });
  }

  return new THREE.MeshStandardMaterial(base);
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
