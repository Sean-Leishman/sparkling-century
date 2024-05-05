import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { State, SatelliteState } from '$lib/state';

const SPHERE_RADIUS = 0.5;
const SPHERE_POSITION = { 'x': 0, 'y': 0, 'z': 0 };

const SATELLITE_RADIUS = 0.1;
const EARTH_RADIUS = 6000; // 63710;

let renderer: THREE.Renderer;
let scene: THREE.Scene;
let camera: THREE.Camera;
let clock: THREE.Clock;
let controls: OrbitControls

const scaleToWorld = (x: number, y: number, z: number) => {
    return { x: x / EARTH_RADIUS, y: y / EARTH_RADIUS, z: z / EARTH_RADIUS };
}

const initaliseScene = (sts: State) => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    clock = new THREE.Clock();
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    let geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 16);
    const texture = new THREE.TextureLoader().load('https://i.imgur.com/kFoWvzw.jpg');
    let material = new THREE.MeshBasicMaterial({ map: texture });
    const planet = new THREE.Mesh(geometry, material);

    scene.add(planet);

    // Add satellites
    geometry = new THREE.PlaneGeometry(SATELLITE_RADIUS, SATELLITE_RADIUS);
    material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });

    const group = new THREE.Group();
    group.name = "SatelliteGroup";

    let plane;
    for (const satellite of sts) {
        plane = new THREE.Mesh(geometry, material);

        const points = []
        for (const coord of satellite.futureStates) {
            const updatedCoords = scaleToWorld(coord.x, coord.y, coord.z);
            points.push(new THREE.Vector3(updatedCoords.x, updatedCoords.y, updatedCoords.z));
        }
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 }));
        scene.add(line);

        plane.position.set(satellite.x, satellite.y, satellite.z);
        plane.name = "Satellite";
        plane.state = satellite;

        group.add(plane);
    }
    scene.add(group);

    clock.start();
}

const animate = () => {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const satellites = scene.getObjectByName("SatelliteGroup").children;
    for (const satellite of satellites) {
        if (satellite.state.updated) {
            satellite.position.set(
                satellite.state.x,
                satellite.state.y,
                satellite.state.z,
            )
            satellite.state.updated = false;
        }

        satellite.translateX(satellite.state.x2 * delta)
        satellite.translateY(satellite.state.y2 * delta)
        satellite.translateZ(satellite.state.z2 * delta)
    }

    controls.update()
    renderer.render(scene, camera);
};

const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};

export const createScene = (el, data) => {
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el });
    initaliseScene(data);
    resize();
    animate();
}

// window.addEventListener('resize', resize);
