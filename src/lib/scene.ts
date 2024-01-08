import * as THREE from 'three';

const SPHERE_RADIUS = 0.5;
const SPHERE_POSITION = {'x':0, 'y':0, 'z':0};
const EARTH_RADIUS = 6378137;

let renderer;
let scene;
let camera;


const llarToWorld = (lat, lng, alt, rad) => {
    let f = 0 
    let ls = Math.atan((1-f)**2 * Math.tan(lat));

    let x = rad * Math.cos(ls) * Math.cos(lng) + alt * Math.cos(lat) * Math.cos(lng);
    let y = rad * Math.cos(ls) * Math.sin(lng) + alt * Math.cos(lat) * Math.sin(lng);
    let z = rad * Math.sin(ls) + alt * Math.sin(lat);

    x /= EARTH_RADIUS;
    y /= EARTH_RADIUS;
    z /= EARTH_RADIUS;

    return {x, y, z};
}

const initaliseScene = (data) => {
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
    for (let satellite of data.above){
       plane = new THREE.Mesh( geometry, material );
       coord = llarToWorld(satellite.satlat, satellite.satlng, satellite.satalt, EARTH_RADIUS);

       plane.position.set(coord.x, coord.y, coord.z);
       console.log(plane.position, coord)
       scene.add(plane);
    }
}

const animate = () => {
  requestAnimationFrame(animate);
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

window.addEventListener('resize', resize);
