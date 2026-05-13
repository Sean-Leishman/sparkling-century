import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { gstime } from 'satellite.js';
import type { State, SatelliteState } from '$lib/state';

const SPHERE_RADIUS = 1.0;
const MAX_SATS = 16384;
const POINT_SIZE = 0.02;
const HOVER_THRESHOLD = 0.015;
const VIEW_OFFSET_FRAC = 0.18;

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let stats: Stats;
let satState: State;
let planet: THREE.Mesh;

let positions: Float32Array;
let pointsGeometry: THREE.BufferGeometry;
let points: THREE.Points;

let highlight: THREE.Mesh;
let highlightVisible = false;

let orbitLine: THREE.Line | null = null;
let currentOrbitSat: SatelliteState | null = null;
let orbitDurationMinutes = 90;
let orbitLastRecompute = 0;

const lastFrameSats: SatelliteState[] = [];
let lastFrameCount = 0;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerActive = false;
let onHoverCallback: (sat: SatelliteState | null) => void = () => {};
let onZoomCallback: (distance: number) => void = () => {};

const initScene = (el: HTMLCanvasElement) => {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(0, 0, 4);

	renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el });
	controls = new OrbitControls(camera, renderer.domElement);
	controls.minDistance = 1.2;
	controls.maxDistance = 12;
	controls.addEventListener('change', () => {
		onZoomCallback(camera.position.length());
	});

	planet = new THREE.Mesh(
		new THREE.SphereGeometry(SPHERE_RADIUS, 48, 24),
		new THREE.MeshBasicMaterial({ color: 0x004422, wireframe: true })
	);
	scene.add(planet);

	positions = new Float32Array(MAX_SATS * 3);
	pointsGeometry = new THREE.BufferGeometry();
	pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	pointsGeometry.setDrawRange(0, 0);

	const satMaterial = new THREE.PointsMaterial({
		color: 0xffff00,
		size: POINT_SIZE,
		sizeAttenuation: true
	});

	points = new THREE.Points(pointsGeometry, satMaterial);
	scene.add(points);

	highlight = new THREE.Mesh(
		new THREE.SphereGeometry(0.025, 12, 8),
		new THREE.MeshBasicMaterial({ color: 0xff3355 })
	);
	highlight.visible = false;
	scene.add(highlight);

	raycaster.params.Points = { threshold: HOVER_THRESHOLD };
};

const buildOrbitGeometry = (sat: SatelliteState): THREE.BufferGeometry => {
	const pts = sat.computeOrbitPoints(orbitDurationMinutes);
	return new THREE.BufferGeometry().setFromPoints(
		pts.map((p) => new THREE.Vector3(p.x, p.y, p.z))
	);
};

const updateOrbitPath = (sat: SatelliteState | null) => {
	if (orbitLine) {
		scene.remove(orbitLine);
		orbitLine.geometry.dispose();
		orbitLine = null;
	}
	currentOrbitSat = sat;
	orbitLastRecompute = Date.now();
	if (!sat) return;

	orbitLine = new THREE.Line(
		buildOrbitGeometry(sat),
		new THREE.LineBasicMaterial({ color: 0xff3355, opacity: 0.7, transparent: true })
	);
	scene.add(orbitLine);
};

const maybeRefreshOrbit = () => {
	if (!currentOrbitSat) return;
	const now = Date.now();
	if (now - orbitLastRecompute < 2000) return;
	orbitLastRecompute = now;

	const pts = currentOrbitSat.computeOrbitPoints(orbitDurationMinutes);
	const newGeom = new THREE.BufferGeometry().setFromPoints(
		pts.map((p) => new THREE.Vector3(p.x, p.y, p.z))
	);
	if (orbitLine) {
		orbitLine.geometry.dispose();
		orbitLine.geometry = newGeom;
	}
};

const syncSatellites = () => {
	const now = Date.now();
	let i = 0;
	for (const sat of satState) {
		if (i >= MAX_SATS) break;
		const dt = (now - sat.timestamp) / 1000;
		positions[i * 3] = sat.x + sat.x2 * dt;
		positions[i * 3 + 1] = sat.y + sat.y2 * dt;
		positions[i * 3 + 2] = sat.z + sat.z2 * dt;
		lastFrameSats[i] = sat;
		i++;
	}
	lastFrameCount = i;
	pointsGeometry.setDrawRange(0, i);
	pointsGeometry.attributes.position.needsUpdate = true;
};

const updateHighlight = () => {
	if (!pointerActive) {
		if (highlightVisible) {
			highlight.visible = false;
			highlightVisible = false;
			updateOrbitPath(null);
			onHoverCallback(null);
		}
		return;
	}

	raycaster.setFromCamera(pointer, camera);
	const hits = raycaster.intersectObject(points, false);

	let hit: SatelliteState | null = null;
	for (const h of hits) {
		const idx = h.index;
		if (idx === undefined || idx >= lastFrameCount) continue;
		hit = lastFrameSats[idx];
		break;
	}

	if (hit) {
		const dt = (Date.now() - hit.timestamp) / 1000;
		highlight.position.set(hit.x + hit.x2 * dt, hit.y + hit.y2 * dt, hit.z + hit.z2 * dt);
		highlight.visible = true;
		highlightVisible = true;
		if (hit !== currentOrbitSat) updateOrbitPath(hit);
		onHoverCallback(hit);
	} else if (highlightVisible) {
		highlight.visible = false;
		highlightVisible = false;
		updateOrbitPath(null);
		onHoverCallback(null);
	}
};

const animate = () => {
	requestAnimationFrame(animate);
	stats.begin();

	// Rotate Earth sphere to match current GMST so the wireframe aligns with
	// the ECI coordinate frame used for satellite positions.
	planet.rotation.z = gstime(new Date());

	syncSatellites();
	maybeRefreshOrbit();
	updateHighlight();
	controls.update();
	renderer.render(scene, camera);
	stats.end();
};

const applyViewOffset = () => {
	const w = window.innerWidth;
	const h = window.innerHeight;
	camera.setViewOffset(w, h, w * VIEW_OFFSET_FRAC, 0, w, h);
};

const resize = () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	applyViewOffset();
	camera.updateProjectionMatrix();
};

const onPointerMove = (ev: PointerEvent) => {
	pointerActive = true;
	pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
	pointer.y = -(ev.clientY / window.innerHeight) * 2 + 1;
};

const onPointerLeave = () => {
	pointerActive = false;
};

export const setCameraDistance = (distance: number) => {
	camera.position.setLength(distance);
	controls.update();
};

export const setOrbitDuration = (minutes: number) => {
	orbitDurationMinutes = minutes;
	if (currentOrbitSat) updateOrbitPath(currentOrbitSat);
};

export const createScene = (
	el: HTMLCanvasElement,
	state: State,
	onHover?: (sat: SatelliteState | null) => void,
	onZoom?: (distance: number) => void
) => {
	satState = state;
	if (onHover) onHoverCallback = onHover;
	if (onZoom) onZoomCallback = onZoom;
	initScene(el);
	stats = new Stats();
	document.body.appendChild(stats.dom);
	resize();
	window.addEventListener('resize', resize);
	el.addEventListener('pointermove', onPointerMove);
	el.addEventListener('pointerleave', onPointerLeave);
	animate();
};
