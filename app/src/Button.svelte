<script>
	export let handleClick;
	export let text;
</script>

<style>
	button {
		width: 200px;
		height: 50px;
	}
</style>

<button on:click={handleClick}> {text} </button>
