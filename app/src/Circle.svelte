<script>
	export let x, y, d
	export let color ="tomato";
</script>

<style>
	span {
		position: absolute;
		border-radius: 500px;
		border: solid 1px tomato;
		transform: translate(-50%, -50%);
	}
</style>

<span style="left:{x}px; top:{y}px; width:{d}px; height:{d}px; border-color: {color};">

</span>