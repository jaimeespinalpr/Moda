import * as THREE from 'three';
import { AvatarMeasurements } from '../types';

const SKIN_COLOR = 0xFFD7C4;
const SKIN_MAT = new THREE.MeshStandardMaterial({
  color: SKIN_COLOR,
  roughness: 0.8,
  metalness: 0.0,
});

function scaled(measurements: AvatarMeasurements) {
  const s = measurements.height / 170;
  return {
    s,
    bust: (measurements.bust / 86) * s,
    waist: (measurements.waist / 66) * s,
    hips: (measurements.hips / 92) * s,
    shoulder: (measurements.shoulderWidth / 38) * s,
  };
}

export function buildAvatar(measurements: AvatarMeasurements): THREE.Group {
  const group = new THREE.Group();
  const { s, bust, waist, hips, shoulder } = scaled(measurements);

  const add = (geo: THREE.BufferGeometry, pos: [number, number, number], rot?: [number, number, number]) => {
    const mesh = new THREE.Mesh(geo, SKIN_MAT.clone());
    mesh.position.set(...pos);
    if (rot) mesh.rotation.set(...rot);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  };

  // Head
  add(new THREE.SphereGeometry(0.115 * s, 32, 24), [0, 1.66 * s, 0]);

  // Neck
  add(new THREE.CylinderGeometry(0.05 * s, 0.058 * s, 0.1 * s, 16), [0, 1.52 * s, 0]);

  // Upper torso (chest)
  const torsoW = shoulder * 0.38;
  const torsoD = bust * 0.075;
  add(
    new THREE.CapsuleGeometry(torsoD, torsoW * 0.7, 8, 16),
    [0, 1.25 * s, 0],
    [0, 0, Math.PI / 2]
  );

  // Mid torso
  const waistW = waist * 0.033;
  add(
    new THREE.CylinderGeometry(waistW, waistW * 1.1, 0.18 * s, 20),
    [0, 0.97 * s, 0]
  );

  // Hips
  const hipW = hips * 0.04;
  add(
    new THREE.CapsuleGeometry(hipW * 0.6, hipW * 1.1, 8, 16),
    [0, 0.82 * s, 0],
    [0, 0, Math.PI / 2]
  );

  const armRaise = Math.PI / 14;

  // Left upper arm
  const uArm = new THREE.CylinderGeometry(0.062 * s, 0.055 * s, 0.3 * s, 16);
  const lArmMesh = add(uArm, [-0.31 * s, 1.26 * s, 0]);
  lArmMesh.rotation.z = armRaise;

  // Right upper arm
  const rArmMesh = add(
    new THREE.CylinderGeometry(0.062 * s, 0.055 * s, 0.3 * s, 16),
    [0.31 * s, 1.26 * s, 0]
  );
  rArmMesh.rotation.z = -armRaise;

  // Left forearm
  add(new THREE.CylinderGeometry(0.048 * s, 0.042 * s, 0.28 * s, 16), [-0.34 * s, 0.96 * s, 0]);

  // Right forearm
  add(new THREE.CylinderGeometry(0.048 * s, 0.042 * s, 0.28 * s, 16), [0.34 * s, 0.96 * s, 0]);

  // Left hand
  add(new THREE.SphereGeometry(0.042 * s, 12, 12), [-0.35 * s, 0.79 * s, 0]);

  // Right hand
  add(new THREE.SphereGeometry(0.042 * s, 12, 12), [0.35 * s, 0.79 * s, 0]);

  // Left thigh
  add(new THREE.CylinderGeometry(0.1 * s, 0.085 * s, 0.38 * s, 20), [-0.12 * s, 0.48 * s, 0]);

  // Right thigh
  add(new THREE.CylinderGeometry(0.1 * s, 0.085 * s, 0.38 * s, 20), [0.12 * s, 0.48 * s, 0]);

  // Left shin
  add(new THREE.CylinderGeometry(0.072 * s, 0.06 * s, 0.38 * s, 16), [-0.12 * s, 0.1 * s, 0]);

  // Right shin
  add(new THREE.CylinderGeometry(0.072 * s, 0.06 * s, 0.38 * s, 16), [0.12 * s, 0.1 * s, 0]);

  // Left foot
  const footGeo = new THREE.BoxGeometry(0.08 * s, 0.05 * s, 0.18 * s);
  add(footGeo, [-0.12 * s, -0.08 * s, 0.04 * s]);

  // Right foot
  add(new THREE.BoxGeometry(0.08 * s, 0.05 * s, 0.18 * s), [0.12 * s, -0.08 * s, 0.04 * s]);

  // Eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x2C3E50 });
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.016 * s, 8, 8), eyeMat);
  leftEye.position.set(-0.038 * s, 1.675 * s, 0.1 * s);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.016 * s, 8, 8), eyeMat);
  rightEye.position.set(0.038 * s, 1.675 * s, 0.1 * s);
  group.add(rightEye);

  group.position.y = 0.1;
  return group;
}
