<script lang="ts">
    import { createScene } from "$lib/scene";
    import { onMount } from "svelte";

    let el;

    onMount(() => {
        createScene(el)
    });
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<canvas bind:this={el}></canvas>
