import * as THREE from 'three';
import { Garment, GarmentType, AvatarMeasurements } from '../types';

function makeMaterial(garment: Garment, wireframe = false) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(garment.material.color),
    roughness: garment.material.roughness,
    metalness: garment.material.metalness,
    wireframe,
    side: THREE.DoubleSide,
  });
}

function tshirtGeometry(s: number, bust: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const hw = bust * 0.048;
  const h = 0.42 * s;
  shape.moveTo(-hw, 0);
  shape.lineTo(-hw * 1.18, h * 0.2);
  shape.lineTo(-hw * 0.9, h * 0.22);
  shape.lineTo(-hw * 0.88, h);
  shape.lineTo(hw * 0.88, h);
  shape.lineTo(hw * 0.9, h * 0.22);
  shape.lineTo(hw * 1.18, h * 0.2);
  shape.lineTo(hw, 0);
  shape.closePath();

  const extrudeSettings = {
    depth: 0.18 * s,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  };
  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

function pantsGeometry(s: number, hips: number, inseam: number): THREE.Group {
  const group = new THREE.Group();
  const hw = hips * 0.023;
  const legH = inseam * 0.006 * s;

  const makeleg = (xOffset: number) => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(xOffset, 0.8 * s, 0),
      new THREE.Vector3(xOffset * 0.9, 0.5 * s, 0),
      new THREE.Vector3(xOffset * 0.85, legH, 0),
    ]);
    const geo = new THREE.TubeGeometry(path, 20, hw * 0.8, 12, false);
    return geo;
  };

  return group;
}

function buildTShirt(garment: Garment, measurements: AvatarMeasurements, wireframe: boolean): THREE.Group {
  const s = measurements.height / 170;
  const bust = measurements.bust / 86;
  const group = new THREE.Group();
  const mat = makeMaterial(garment, wireframe);

  // Body
  const hw = 0.195 * bust * s;
  const h = 0.45 * s;
  const d = 0.11 * bust * s;

  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-hw, 0);
  bodyShape.quadraticCurveTo(-hw * 1.05, h * 0.5, -hw * 0.92, h);
  bodyShape.lineTo(hw * 0.92, h);
  bodyShape.quadraticCurveTo(hw * 1.05, h * 0.5, hw, 0);
  bodyShape.closePath();

  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
    depth: d * 2,
    bevelEnabled: false,
  });
  const body = new THREE.Mesh(bodyGeo, mat);
  body.position.set(-hw, 0.77 * s, -d);
  group.add(body);

  // Left sleeve
  const sleeveShape = new THREE.Shape();
  sleeveShape.moveTo(0, 0);
  sleeveShape.lineTo(0.16 * s, 0.06 * s);
  sleeveShape.lineTo(0.18 * s, 0.13 * s);
  sleeveShape.lineTo(0.02 * s, 0.15 * s);
  sleeveShape.closePath();

  const sleeveGeo = new THREE.ExtrudeGeometry(sleeveShape, {
    depth: 0.1 * s,
    bevelEnabled: false,
  });

  const lSleeve = new THREE.Mesh(sleeveGeo, mat.clone());
  lSleeve.position.set(-hw * 1.0, 1.12 * s, -0.05 * s);
  lSleeve.rotation.set(0, 0, Math.PI / 8);
  group.add(lSleeve);

  const rSleeve = new THREE.Mesh(sleeveGeo.clone(), mat.clone());
  rSleeve.position.set(hw * 0.85, 1.12 * s, -0.05 * s);
  rSleeve.rotation.set(0, 0, -Math.PI / 8);
  group.add(rSleeve);

  return group;
}

function buildPants(garment: Garment, measurements: AvatarMeasurements, wireframe: boolean): THREE.Group {
  const s = measurements.height / 170;
  const hip = measurements.hips / 92;
  const group = new THREE.Group();
  const mat = makeMaterial(garment, wireframe);

  const legRadius = 0.075 * s * hip;
  const waistY = 0.82 * s;
  const floorY = -0.08 * s;

  const makeLeg = (xPos: number) => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(xPos, waistY, 0),
      new THREE.Vector3(xPos * 1.1, waistY * 0.55, 0),
      new THREE.Vector3(xPos * 1.05, waistY * 0.1, 0),
      new THREE.Vector3(xPos, floorY, 0),
    ]);
    const radii = [legRadius * 1.3, legRadius * 1.1, legRadius * 0.85, legRadius * 0.7];
    const geo = new THREE.TubeGeometry(path, 24, legRadius, 14, false);
    return new THREE.Mesh(geo, mat.clone());
  };

  group.add(makeLeg(-0.12 * s));
  group.add(makeLeg(0.12 * s));

  // Waistband
  const waistGeo = new THREE.TorusGeometry(0.17 * s * hip, 0.025 * s, 8, 32, Math.PI * 2);
  const waist = new THREE.Mesh(waistGeo, mat.clone());
  waist.position.set(0, waistY, 0);
  waist.rotation.x = Math.PI / 2;
  group.add(waist);

  return group;
}

function buildDress(garment: Garment, measurements: AvatarMeasurements, wireframe: boolean): THREE.Group {
  const s = measurements.height / 170;
  const bust = measurements.bust / 86;
  const hip = measurements.hips / 92;
  const group = new THREE.Group();
  const mat = makeMaterial(garment, wireframe);

  // Bodice
  const bodiceShape = new THREE.Shape();
  const bw = 0.195 * bust * s;
  bodiceShape.moveTo(-bw, 0);
  bodiceShape.quadraticCurveTo(-bw * 1.02, 0.17 * s, -bw * 0.85, 0.32 * s);
  bodiceShape.lineTo(bw * 0.85, 0.32 * s);
  bodiceShape.quadraticCurveTo(bw * 1.02, 0.17 * s, bw, 0);
  bodiceShape.closePath();

  const bodiceGeo = new THREE.ExtrudeGeometry(bodiceShape, {
    depth: 0.2 * s,
    bevelEnabled: false,
  });
  const bodice = new THREE.Mesh(bodiceGeo, mat.clone());
  bodice.position.set(-bw, 0.82 * s, -0.1 * s);
  group.add(bodice);

  // Skirt (flared)
  const skirtPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.82 * s, 0),
    new THREE.Vector3(0, 0.55 * s, 0),
    new THREE.Vector3(0, 0.0, 0),
  ]);

  const skirtGeo = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.18 * s * hip, 0.82 * s),
      new THREE.Vector2(0.2 * s * hip, 0.6 * s),
      new THREE.Vector2(0.28 * s * hip, 0.3 * s),
      new THREE.Vector2(0.35 * s * hip, 0.0),
    ],
    32
  );
  const skirt = new THREE.Mesh(skirtGeo, mat.clone());
  group.add(skirt);

  return group;
}

function buildSkirt(garment: Garment, measurements: AvatarMeasurements, wireframe: boolean): THREE.Group {
  const s = measurements.height / 170;
  const hip = measurements.hips / 92;
  const group = new THREE.Group();
  const mat = makeMaterial(garment, wireframe);

  const skirtGeo = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.19 * s * hip, 0.82 * s),
      new THREE.Vector2(0.21 * s * hip, 0.55 * s),
      new THREE.Vector2(0.25 * s * hip, 0.25 * s),
      new THREE.Vector2(0.27 * s * hip, 0.0),
    ],
    32
  );
  const skirt = new THREE.Mesh(skirtGeo, mat);
  group.add(skirt);

  const waistGeo = new THREE.TorusGeometry(0.195 * s * hip, 0.022 * s, 8, 32, Math.PI * 2);
  const waist = new THREE.Mesh(waistGeo, mat.clone());
  waist.position.set(0, 0.82 * s, 0);
  waist.rotation.x = Math.PI / 2;
  group.add(waist);

  return group;
}

function buildJacket(garment: Garment, measurements: AvatarMeasurements, wireframe: boolean): THREE.Group {
  const s = measurements.height / 170;
  const bust = measurements.bust / 86;
  const shoulder = measurements.shoulderWidth / 38;
  const group = new THREE.Group();
  const mat = makeMaterial(garment, wireframe);

  const hw = 0.21 * bust * s;
  const h = 0.52 * s;
  const d = 0.12 * s;

  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-hw, 0);
  bodyShape.lineTo(-hw * 1.22, h * 0.15);
  bodyShape.lineTo(-hw * 1.1, h);
  bodyShape.lineTo(-hw * 0.1, h * 1.05);
  bodyShape.lineTo(hw * 0.1, h * 1.05);
  bodyShape.lineTo(hw * 1.1, h);
  bodyShape.lineTo(hw * 1.22, h * 0.15);
  bodyShape.lineTo(hw, 0);
  bodyShape.closePath();

  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, { depth: d * 2, bevelEnabled: false });
  const body = new THREE.Mesh(bodyGeo, mat);
  body.position.set(-hw, 0.74 * s, -d);
  group.add(body);

  // Long sleeves
  const makeFullSleeve = (xSign: number) => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(xSign * hw * 1.1, 1.22 * s, 0),
      new THREE.Vector3(xSign * (hw * 1.1 + 0.1 * s), 1.0 * s, 0),
      new THREE.Vector3(xSign * (hw * 1.1 + 0.15 * s), 0.75 * s, 0),
    ]);
    const sleeveGeo = new THREE.TubeGeometry(path, 16, 0.065 * s, 12, false);
    return new THREE.Mesh(sleeveGeo, mat.clone());
  };

  group.add(makeFullSleeve(-1));
  group.add(makeFullSleeve(1));

  // Lapels
  const lapelShape = new THREE.Shape();
  lapelShape.moveTo(0, 0);
  lapelShape.lineTo(0.08 * s, 0.12 * s);
  lapelShape.lineTo(0.04 * s, 0.22 * s);
  lapelShape.lineTo(-0.01 * s, 0.1 * s);
  lapelShape.closePath();

  const lapelGeo = new THREE.ExtrudeGeometry(lapelShape, { depth: 0.015 * s, bevelEnabled: false });

  const lLapel = new THREE.Mesh(lapelGeo, mat.clone());
  lLapel.position.set(-0.06 * s, 1.0 * s, 0.095 * s);
  group.add(lLapel);

  const rLapel = new THREE.Mesh(lapelGeo.clone(), mat.clone());
  rLapel.position.set(0.14 * s, 1.0 * s, 0.095 * s);
  rLapel.rotation.y = Math.PI;
  group.add(rLapel);

  return group;
}

function buildCoat(garment: Garment, measurements: AvatarMeasurements, wireframe: boolean): THREE.Group {
  const s = measurements.height / 170;
  const bust = measurements.bust / 86;
  const group = new THREE.Group();
  const mat = makeMaterial(garment, wireframe);

  const hw = 0.22 * bust * s;
  const h = 0.95 * s;
  const d = 0.13 * s;

  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-hw * 0.85, 0);
  bodyShape.lineTo(-hw * 1.2, h * 0.12);
  bodyShape.lineTo(-hw * 1.05, h);
  bodyShape.lineTo(hw * 1.05, h);
  bodyShape.lineTo(hw * 1.2, h * 0.12);
  bodyShape.lineTo(hw * 0.85, 0);
  bodyShape.closePath();

  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, { depth: d * 2, bevelEnabled: false });
  const body = new THREE.Mesh(bodyGeo, mat);
  body.position.set(-hw * 0.85, 0.2 * s, -d);
  group.add(body);

  const makeFullSleeve = (xSign: number) => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(xSign * hw * 1.1, 1.22 * s, 0),
      new THREE.Vector3(xSign * (hw * 1.15 + 0.1 * s), 0.95 * s, 0),
      new THREE.Vector3(xSign * (hw * 1.15 + 0.16 * s), 0.68 * s, 0),
    ]);
    const sleeveGeo = new THREE.TubeGeometry(path, 16, 0.075 * s, 12, false);
    return new THREE.Mesh(sleeveGeo, mat.clone());
  };

  group.add(makeFullSleeve(-1));
  group.add(makeFullSleeve(1));

  return group;
}

function buildBlouse(garment: Garment, measurements: AvatarMeasurements, wireframe: boolean): THREE.Group {
  const s = measurements.height / 170;
  const bust = measurements.bust / 86;
  const group = new THREE.Group();
  const mat = makeMaterial(garment, wireframe);

  const hw = 0.185 * bust * s;
  const h = 0.42 * s;
  const d = 0.105 * s;

  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-hw, 0);
  bodyShape.quadraticCurveTo(-hw * 1.03, h * 0.4, -hw * 0.92, h);
  bodyShape.lineTo(hw * 0.92, h);
  bodyShape.quadraticCurveTo(hw * 1.03, h * 0.4, hw, 0);
  bodyShape.closePath();

  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, { depth: d * 2, bevelEnabled: false });
  const body = new THREE.Mesh(bodyGeo, mat);
  body.position.set(-hw, 0.77 * s, -d);
  group.add(body);

  const makeFullSleeve = (xSign: number) => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(xSign * hw * 0.98, 1.15 * s, 0),
      new THREE.Vector3(xSign * (hw + 0.12 * s), 1.0 * s, 0),
      new THREE.Vector3(xSign * (hw + 0.17 * s), 0.78 * s, 0),
    ]);
    const sleeveGeo = new THREE.TubeGeometry(path, 14, 0.055 * s, 10, false);
    return new THREE.Mesh(sleeveGeo, mat.clone());
  };

  group.add(makeFullSleeve(-1));
  group.add(makeFullSleeve(1));

  return group;
}

export function buildGarment(
  garment: Garment,
  measurements: AvatarMeasurements,
  wireframe = false
): THREE.Group {
  switch (garment.type) {
    case 'tshirt': return buildTShirt(garment, measurements, wireframe);
    case 'pants': return buildPants(garment, measurements, wireframe);
    case 'dress': return buildDress(garment, measurements, wireframe);
    case 'skirt': return buildSkirt(garment, measurements, wireframe);
    case 'jacket': return buildJacket(garment, measurements, wireframe);
    case 'coat': return buildCoat(garment, measurements, wireframe);
    case 'blouse': return buildBlouse(garment, measurements, wireframe);
    default: return buildTShirt(garment, measurements, wireframe);
  }
}
