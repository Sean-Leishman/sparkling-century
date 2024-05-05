<script lang="ts">
	import { createScene } from '$lib/scene';
	import { State, SatelliteState } from '$lib/state';
	import { onMount } from 'svelte';

	let el;
	let state: State;
	let data;

	const fetchData = async (init = false) => {
		const response = await fetch('/api/satellite', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});

		const data_json = await response.json();
		data = data_json.body;

		if (init) state = new State(data);
		// state.updateState(data);
	};

	onMount(() => {
        let updateStateInterval: NodeJS.Timeout;

		const mountFetch = async () => {
			await fetchData(true);

            updateStateInterval = setInterval(() => {
                state.updateState();
            }, 1000);

			createScene(el, state);
		};

		mountFetch();

		const updateInterval = setInterval(fetchData, 60000 * 60);

		return () => {
			clearInterval(updateInterval);
			clearInterval(updateStateInterval);
		};
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<p>{data}</p>
<canvas bind:this={el}></canvas>
