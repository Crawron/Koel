import esbuild from "esbuild"
import glob from "fast-glob"

await esbuild.build({
	entryPoints: await glob("src/**/*.ts"),
	outdir: "build",
	sourcemap: true,
	logLevel: "info",
	platform: "node",
	target: "esnext",
	format: "cjs",
})
