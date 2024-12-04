<script lang="ts">
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<div class="h-full w-full flex flex-col">
	<Header />

	{@render children()}

	<Footer />
</div>

<style>
	.tree {
		--spacing: 1.5rem;
		--radius: 10px;
	}
	.tree li {
		display: block;
		position: relative;
		padding-left: calc(2 * var(--spacing) - var(--radius) - 2px);
	}
	.tree ul {
		margin-left: calc(var(--radius) - var(--spacing));
		padding-left: 0;
	}
	.tree ul li {
		border-left: 2px solid #ddd;
	}
	.tree ul li:last-child {
		border-color: transparent;
	}
	.tree ul li::before {
		content: '';
		display: block;
		position: absolute;
		top: calc(var(--spacing) / -2);
		left: -2px;
		width: calc(var(--spacing) + 2px);
		height: calc(var(--spacing) + 1px);
		border: solid #ddd;
		border-width: 0 0 2px 2px;
	}
	.tree summary:focus-visible {
		outline: 1px dotted #000;
	}
</style>
