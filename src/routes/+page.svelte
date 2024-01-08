<script lang="ts">
    import { createScene } from "$lib/scene";
    import { onMount } from "svelte";

    export let data: PageData;
    let el;

    onMount(() => {
        createScene(el, data)
    });

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<p>{data}</p>
<canvas bind:this={el}></canvas>
