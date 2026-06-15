import React, { useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useDesignStore } from '../../store/designStore';
import { buildAvatar } from '../../utils/avatarGeometry';
import { buildGarment } from '../../utils/garmentGeometry';

export default function ThreeScene() {
  const store = useDesignStore();
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const garmentGroupRef = useRef<THREE.Group | null>(null);
  const glRef = useRef<ExpoWebGLRenderingContext | null>(null);

  // Camera orbit state
  const cameraState = useRef({
    theta: 0,
    phi: Math.PI / 6,
    radius: 2.8,
    target: new THREE.Vector3(0, 0.85, 0),
    prevTheta: 0,
    prevPhi: Math.PI / 6,
  });

  const updateCamera = useCallback(() => {
    const cam = cameraRef.current;
    const cs = cameraState.current;
    if (!cam) return;
    const x = cs.radius * Math.sin(cs.phi) * Math.sin(cs.theta);
    const y = cs.radius * Math.cos(cs.phi) + cs.target.y;
    const z = cs.radius * Math.sin(cs.phi) * Math.cos(cs.theta);
    cam.position.set(x, y, z);
    cam.lookAt(cs.target);
  }, []);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onBegin(() => {
      const cs = cameraState.current;
      cs.prevTheta = cs.theta;
      cs.prevPhi = cs.phi;
    })
    .onUpdate((e) => {
      const cs = cameraState.current;
      cs.theta = cs.prevTheta - e.translationX * 0.008;
      cs.phi = Math.max(0.1, Math.min(Math.PI * 0.85, cs.prevPhi - e.translationY * 0.006));
      updateCamera();
    });

  const pinchGesture = Gesture.Pinch()
    .runOnJS(true)
    .onUpdate((e) => {
      cameraState.current.radius = Math.max(1.2, Math.min(6, cameraState.current.radius / e.scale));
      updateCamera();
    });

  const composed = Gesture.Simultaneous(panGesture, pinchGesture);

  const rebuildScene = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old avatar
    if (avatarGroupRef.current) {
      scene.remove(avatarGroupRef.current);
    }
    // Remove old garments
    if (garmentGroupRef.current) {
      scene.remove(garmentGroupRef.current);
    }

    if (store.showAvatar) {
      const avatar = buildAvatar(store.avatar);
      avatarGroupRef.current = avatar;
      scene.add(avatar);
    }

    const gGroup = new THREE.Group();
    garmentGroupRef.current = gGroup;
    store.garments.forEach((g) => {
      if (g.visible) {
        const mesh = buildGarment(g, store.avatar, store.showWireframe);
        mesh.userData.garmentId = g.id;
        gGroup.add(mesh);
      }
    });
    scene.add(gGroup);
  }, [store.garments, store.avatar, store.showAvatar, store.showWireframe]);

  const onContextCreate = useCallback(async (gl: ExpoWebGLRenderingContext) => {
    glRef.current = gl;
    const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;

    const renderer = new Renderer({ gl });
    renderer.setSize(w, h);
    renderer.setClearColor(0x0D0D1A, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0D0D1A, 0.12);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 100);
    cameraRef.current = camera;
    updateCamera();

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, store.ambientLightIntensity);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff5e0, 1.4);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f0ff, 0.6);
    fillLight.position.set(-2, 2, -1);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // Ground grid
    if (store.showGrid) {
      const grid = new THREE.GridHelper(4, 20, 0x333355, 0x222244);
      grid.position.y = -0.05;
      scene.add(grid);
    }

    // Ground plane (shadow receiver)
    const groundGeo = new THREE.PlaneGeometry(6, 6);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0D0D1A,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    rebuildScene();

    let angle = 0;
    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      angle += 0.002;
      // Subtle auto-rotate when idle (very slow)
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  }, []);

  // Rebuild when garments or avatar changes
  useEffect(() => {
    if (sceneRef.current) rebuildScene();
  }, [rebuildScene]);

  return (
    <GestureDetector gesture={composed}>
      <View style={styles.container}>
        <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
});
