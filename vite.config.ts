import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],

	test: {
		globals: true, // enable Jest-style globals
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
