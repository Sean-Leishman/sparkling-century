<script lang="ts">
    import { createScene } from "$lib/scene";
    import { State, SatelliteState } from "$lib/state";
    import { onMount } from "svelte";

    let el;
    let state: State;
    export let data;

    const fetchData = async () => {
        console.log("Update");

        const response = await fetch(
            '/api/satellite',
            { 
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const data_json = await response.json();
        data = data_json.body;
        state.updateState(data);
    }

    onMount(() => {
        fetchData();
        state = new State(data); 

        const updateInterval = setInterval(fetchData, 10000);
        createScene(el, state);

        return () => {clearInterval(updateInterval);};
    });

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<p>{data}</p>
<canvas bind:this={el}></canvas> 
