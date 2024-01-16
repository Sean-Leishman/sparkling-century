<script lang="ts">
	import { createScene } from '$lib/scene';
	import { State, SatelliteState } from '$lib/state';
	import { onMount } from 'svelte';

	let el;
	let state: State;
	export let data;

	const fetchData = async (init = false) => {
		const response = await fetch('/api/satellite', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});

		const data_json = await response.json();
		data = data_json.body;

		const satellite_ids = data.above.map((el) => el.satid);
		const position_response = await fetch('/api/position', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(satellite_ids)
		});

		if (init) {
			return;
		}

		state.updateState(data);
	};

	onMount(() => {
		fetchData(true);
		state = new State(data);

		const updateInterval = setInterval(fetchData, 10000);
		createScene(el, state);

		return () => {
			clearInterval(updateInterval);
		};
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<p>{data}</p>
<canvas bind:this={el}></canvas>
