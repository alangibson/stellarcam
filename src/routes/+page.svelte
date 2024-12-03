<script lang="ts">
	import { Drawing } from '$lib/domain/drawing';
	import type { InputDrawing } from '$lib/input/drawing.svelte';
	import { InputFile } from '$lib/input/input';
	import { clean, Renderer } from '$lib/output/render';
	import { SvgRenderDrawingConfig } from '$lib/output/svg';

	// import Counter from './Counter.svelte';
	let activeContentTab = $state(0);

	let files: FileList = $state();
	let inputDrawing: InputDrawing | undefined = $state();
	let drawing: Drawing|undefined = $state();

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
					drawing = Drawing.from({tolerance: 0.5}, inputDrawing);
					console.log(drawing);

					const renderer = new Renderer();
					const svgLines: string[] = renderer.drawing(SvgRenderDrawingConfig, drawing);
					const svg: string = clean(svgLines);
					// console.log(svgLines);

					// TODO set Drawing tab to Drawing
					// TODO Apply operation (if any) to set Program tab
					// TODO Apply postprocessor to set gcode in Gcode tab
				};
				reader.readAsText(file);
			}
		}
	});
</script>

<svelte:head>
	<title>StellarCAM</title>
	<meta name="description" content="StellarCAM" />
</svelte:head>

<div class="flex flex-col border border-solid">
	<!-- Navbar -->
	<div class="border border-solid">
		<nav>
			<ul class="flex items-center">
				<li class="px-2">
					<input type="file" accept="image/svg+xml,image/x-dxf" bind:files />
				</li>
			</ul>
		</nav>
	</div>

	<!-- Middle row -->
	<div class="flex flex-row border border-solid">
		<!-- Left column -->
		<div class="flex flex-col border border-solid p-2">
			<!-- Drawing-->
			<div class="border border-solid">
				<h3>Drawing</h3>
				{inputDrawing}
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
				<h3>Program</h3>
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
		</div>

		<!-- Center column -->
		<div class="overflow-scroll border border-solid">
			<!-- Navigation tabs -->
			<ul
				class="flex flex-wrap border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400"
			>
				<li class="me-1">
					<button
						class="inline-block rounded-t-lg bg-gray-100 p-4 text-blue-600"
						onclick={() => (activeContentTab = 0)}
					>
						Drawing
					</button>
				</li>
				<li class="me-2">
					<button
						class="inline-block rounded-t-lg bg-gray-100 p-4 text-blue-600"
						onclick={() => (activeContentTab = 1)}
					>
						Program
					</button>
				</li>
				<li class="me-2">
					<button
						class="inline-block rounded-t-lg bg-gray-100 p-4 text-blue-600"
						onclick={() => (activeContentTab = 2)}
					>
						Gcode
					</button>
				</li>
			</ul>

			<!-- Content -->
			<div class="content">
				<!-- Drawing content -->
				{#if activeContentTab === 0}
					<div class="drawing">
						<img
							class="object-contain"
							src="https://upload.wikimedia.org/wikipedia/commons/6/65/Tiger_clipart.svg"
						/>
					</div>
				{/if}

				<!-- Program content -->
				{#if activeContentTab === 1}
					<div class="program">
						<img src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Ghostscript_Tiger.svg" />
					</div>
				{/if}

				<!-- GCode content -->
				{#if activeContentTab === 2}
					<div class="gcode">
						<pre>Gcode goes here</pre>
					</div>
				{/if}
			</div>
		</div>

		<!-- Right column -->
		<div class="border border-solid">
			<!-- Import settings -->
			<div>
				<h3 class="font-bold">Import</h3>
				<form>
					<label for="import-tolerance">Tolerance</label>
					<input name="import-tolerance" value="0.5"/>
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
	</div>

	<!-- Toolbar -->
	<div class="border border-solid">Toolbar</div>
</div>

<style>
</style>
