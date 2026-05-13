<script lang="ts">
	import { createScene, setCameraDistance, setOrbitDuration } from '$lib/scene';
	import { State, type TLE, type SatelliteState } from '$lib/state';
	import { onMount } from 'svelte';

	export let data: { tles: TLE[] };

	let canvas: HTMLCanvasElement;
	let state: State;
	let hovered: SatelliteState | null = null;

	let zoom = 4;
	let traceMinutes = 90;

	const fmt = (n: number, digits = 2) => n.toFixed(digits);

	onMount(() => {
		state = new State(data.tles);
		createScene(
			canvas,
			state,
			(sat) => { hovered = sat; },
			(d) => { zoom = Math.round(d * 10) / 10; }
		);
		const interval = setInterval(() => state.propagate(new Date()), 2000);
		return () => clearInterval(interval);
	});

	const onZoomSlider = (e: Event) => {
		zoom = Number((e.target as HTMLInputElement).value);
		setCameraDistance(zoom);
	};

	const onTraceSlider = (e: Event) => {
		traceMinutes = Number((e.target as HTMLInputElement).value);
		setOrbitDuration(traceMinutes);
	};
</script>

<canvas bind:this={canvas}></canvas>

<div class="controls">
	<div class="control-group">
		<label>Zoom</label>
		<input
			type="range"
			min="1.2"
			max="12"
			step="0.1"
			value={zoom}
			orient="vertical"
			on:input={onZoomSlider}
		/>
	</div>
	<div class="control-group">
		<label>Trace {traceMinutes}m</label>
		<input
			type="range"
			min="5"
			max="360"
			step="5"
			value={traceMinutes}
			orient="vertical"
			on:input={onTraceSlider}
		/>
	</div>
</div>

{#if hovered}
	<div class="panel">
		<div class="name">{hovered.name}</div>
		<div class="row"><span>id</span><span>{hovered.id}</span></div>
		<div class="row"><span>speed</span><span>{fmt(hovered.speedKmS())} km/s</span></div>
		<div class="row"><span>lat</span><span>{fmt(hovered.lat, 3)}°</span></div>
		<div class="row"><span>lng</span><span>{fmt(hovered.lng, 3)}°</span></div>
		<div class="row"><span>alt</span><span>{fmt(hovered.altKm, 1)} km</span></div>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		overflow: hidden;
		background: #000;
		color: #ddd;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}
	canvas {
		display: block;
	}
	.controls {
		position: fixed;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: row;
		gap: 12px;
		align-items: center;
	}
	.control-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
	.control-group label {
		font-size: 11px;
		color: #888;
		writing-mode: horizontal-tb;
		white-space: nowrap;
	}
	input[type='range'][orient='vertical'] {
		writing-mode: vertical-lr;
		direction: rtl;
		height: 140px;
		width: 6px;
		cursor: pointer;
		accent-color: #4af;
	}
	.panel {
		position: fixed;
		top: 16px;
		right: 16px;
		min-width: 240px;
		padding: 12px 14px;
		background: rgba(20, 20, 20, 0.85);
		border: 1px solid #333;
		border-radius: 6px;
		font-size: 13px;
		pointer-events: none;
	}
	.name {
		font-weight: 600;
		color: #ffd84a;
		margin-bottom: 8px;
		word-break: break-word;
	}
	.row {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 2px 0;
	}
	.row span:first-child {
		color: #888;
	}
</style>
