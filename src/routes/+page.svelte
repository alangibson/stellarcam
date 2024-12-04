<script lang="ts">
	import { Drawing } from '$lib/domain/drawing';
	import type { InputDrawing } from '$lib/input/drawing.svelte';
	import { InputFile } from '$lib/input/input';
	import { clean, Renderer } from '$lib/output/render';
	import { SvgRenderDrawingConfig } from '$lib/output/svg';
	import panzoom from 'panzoom';

	// import Counter from './Counter.svelte';
	let activeContentTab = $state(0);

	let files: FileList = $state();
	let inputDrawing: InputDrawing | undefined = $state();
	let drawing: Drawing | undefined = $state();

	let svgDrawing: string | undefined = $state();

	$effect(() => {
		if (files) {
			for (const file of files) {
				console.log(`${file.name}: ${file.size} bytes`);
				const reader = new FileReader();
				reader.onload = () => {
					// Load up file contents into InputDrawing
					const fileContent: string = reader.result; // File content is read as a string
					inputDrawing = new InputFile().from(file.name, fileContent);
					// TODO get input tolerance dynamically
					drawing = Drawing.from({ tolerance: 0.5 }, inputDrawing);
					// console.log(drawing);

					const renderer = new Renderer();
					const svgLines: string[] = renderer.drawing(SvgRenderDrawingConfig, drawing);
					// const svg: string = clean(svgLines);
					// console.log(svgLines);

					svgDrawing = clean(svgLines);

					// TODO set Drawing tab to Drawing
					// TODO Apply operation (if any) to set Program tab
					// TODO Apply postprocessor to set gcode in Gcode tab
				};
				reader.readAsText(file);
			}
		}
		if (svgDrawing) {
			// just grab a DOM element
			const element = document.querySelector('svg#drawing');
			console.log(element);
			// And pass it to panzoom
			panzoom(element);
		}
	});

</script>

<svelte:head>
	<title>StellarCAM</title>
	<meta name="description" content="StellarCAM" />
</svelte:head>

<main class="flex flex-grow overflow-hidden border border-solid">
	<!-- Left column -->
	<div class="flex flex-col border border-solid p-2">
		
		<!-- File chooser -->
		<div class="border border-solid">
			<h3>Input</h3>
			<ul class="flex items-center">
				<li class="px-2">
					<input type="file" accept="image/svg+xml,image/x-dxf" bind:files />
				</li>
			</ul>
		</div>

		<!-- Drawing-->
		<div class="border border-solid">
			<h3 onclick={() => (activeContentTab = 0)}>Drawing</h3>
			<ul class="tree">
				{#if inputDrawing}
					{#each Object.values(inputDrawing.layers) as layer}
						<li>
							<details>
								<summary>Layer ({layer.name})</summary>
								<ul>
									{#each layer.shapes as shape}
										<li>
											<details>
												<summary>Shape ({shape.type})</summary>
											</details>
										</li>
									{/each}
								</ul>
							</details>
						</li>
					{/each}
				{/if}
			</ul>
		</div>

		<!-- Operations -->
		<div class="border border-solid">
			<h3>Operations</h3>
		</div>

		<!-- Program -->
		<div class="border border-solid">
			<h3 onclick={() => (activeContentTab = 1)}>Program</h3>
			<ul class="tree">
				<li>
					<details open>
						<summary>Program <!--{{program}}--></summary>
						<ul>
							<li>
								<details open>
									<summary>Machine <!--{{program.machine}}--></summary>
									<ul>
										<li>
											<details open>
												<summary>Stock <!--{{program.machine.stock}}--></summary>
												<ul>
													<!-- {{#program.machine.stock.parts}} -->
													<li>
														<details open>
															<summary>Part <!--{{.}}--></summary>
															<ul>
																<!-- {{#children}} -->
																<li>
																	<details open>
																		<summary>Cut <!--{{.}}--></summary>
																	</details>
																</li>
																<!-- {{/children}} -->
															</ul>
														</details>
													</li>
													<!-- {{/program.machine.stock.parts}} -->
												</ul>
											</details>
										</li>
									</ul>
								</details>
							</li>
						</ul>
					</details>
				</li>
			</ul>
		</div>

		<!-- Output -->
		 <div>
			<h3 onclick={() => (activeContentTab = 2)}>Output</h3>
		 </div>
	</div>

	<!-- Center column -->
	<div class="flex-grow overflow-hidden border border-solid">
		
		<!-- Content -->
		<div class="content">
			<!-- Drawing content -->
			<div class="drawing" style="{ activeContentTab !== 0 ? 'display:none': '' }">
				{#if svgDrawing}
					<div id="svgDrawing">
						{@html svgDrawing}
					</div>
				{:else}
					<!-- <img
						class="object-contain"
						src="https://upload.wikimedia.org/wikipedia/commons/6/65/Tiger_clipart.svg"
					/> -->
				{/if}
			</div>

			<!-- Program content -->
			<div class="program" style="{ activeContentTab !== 1 ? 'display:none': '' }">
				<img src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Ghostscript_Tiger.svg" />
			</div>

			<!-- GCode content -->
			<div class="gcode" style="{ activeContentTab !== 2 ? 'display:none': '' }">
				<pre>Gcode goes here</pre>
			</div>
		</div>

	</div>

	<!-- Right column -->
	<div class="border border-solid">
		<!-- Import settings -->
		<div>
			<h3 class="font-bold">Import</h3>
			<form>
				<label for="import-tolerance">Tolerance</label>
				<input name="import-tolerance" value="0.5" />
			</form>
		</div>

		<!-- Postprocessor settings -->
		<div>
			<h3 class="font-bold">Postprocessor</h3>
		</div>

		<!-- Operation settings -->
		<div>
			<h3 class="font-bold">Operation</h3>
		</div>

		<!-- Machine settings -->
		<div>
			<h3 class="font-bold">Machine</h3>
		</div>

		<!-- Stock settings -->
		<div>
			<h3 class="font-bold">Stock</h3>
		</div>

		<!-- Part settings -->
		<div>
			<h3 class="font-bold">Part</h3>
		</div>
	</div>
</main>

<style>
	#svgDrawing {
		/* TODO dont hard code stroke width */
		/* stroke-width: 1mm; */
		stroke: black;
		fill: none;
		stroke-width: 1;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	svg {
		stroke: gray;
		fill: none;
		stroke-width: 1;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.point {
		stroke-width: 1;
	}
	.start.point {
		stroke: green;
	}
	.end.point {
		stroke: red;
	}
	.middle.point {
		stroke: blue;
	}
	.center.point {
		stroke: yellow;
	}
	.control.point {
		stroke: blue;
	}

	.radius {
		stroke: yellow;
	}

	.line {
	}
	.control.line {
		stroke: none;
	}

	.offset {
	}

	.rapid {
		stroke: blue;
		stroke-dasharray: 1;
		stroke-linecap: butt;
		stroke-linejoin: miter;
		stroke-opacity: 0.5;
	}

	.chain {
	}
</style>
