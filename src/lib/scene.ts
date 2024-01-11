import * as THREE from 'three';
import { State } from '$lib/state';

const SPHERE_RADIUS = 0.5;
const SPHERE_POSITION = {'x':0, 'y':0, 'z':0};

let renderer;
let scene;
let camera;

let satellites = []; 



const initaliseScene = (sts: State) => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    let geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 16);
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    let planet = new THREE.Mesh(geometry, material);

    scene.add(planet);

    // Add satellites
    geometry = new THREE.PlaneGeometry(0.01, 0.01);
    material = new THREE.MeshBasicMaterial({color:0xffff00, side: THREE.DoubleSide});


    let plane;
    let coord;
    for (let satellite of sts){
       plane = new THREE.Mesh( geometry, material );

       plane.position.set(satellite.x, satellite.y, satellite.z);
       plane.name = "Satellite";
       plane.state = satellite;

       scene.add(plane);
    }
}

const updateVelocity = async () => {
    const newSatellites = await api.getSatellites();
}

const animate = () => {
  requestAnimationFrame(animate);

  for (let satellite of satellites) {
    // EKF for measurement/motion model 



  }

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
