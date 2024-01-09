<script lang="ts">
    import { createScene } from "$lib/scene";
    import { onMount } from "svelte";

    let el;
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
        data = data_json.body.above
    }

    onMount(() => {
        fetchData();
        const updateInterval = setInterval(fetchData, 10000);
        createScene(el, data);

        return () => {clearInterval(updateInterval);};
    });

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<p>{data}</p>
<canvas bind:this={el}></canvas> 
