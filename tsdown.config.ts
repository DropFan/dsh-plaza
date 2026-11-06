import { readFile } from 'node:fs/promises'
import { defineConfig } from 'tsdown'
import { transform } from 'lightningcss'

function inlineCss() {
  const suffix = '.css?inline'
  return {
    name: 'dsh-plaza-inline-css',
    resolveId(source: string, importer: string | undefined) {
      if (!source.endsWith(suffix) || importer === undefined) return null
      return new URL(source.slice(0, -'?inline'.length), `file://${importer}`).pathname + '?dsh-inline'
    },
    async load(this: { addWatchFile(file: string): void }, id: string) {
      if (!id.endsWith('?dsh-inline')) return null
      const file = id.slice(0, -'?dsh-inline'.length)
      this.addWatchFile(file)
      const source = await readFile(file)
      const { code } = transform({ filename: file, code: source, minify: true })
      return `export default ${JSON.stringify(code.toString())}`
    },
  }
}

const shared = { target: 'es2022', sourcemap: true, clean: false } as const

export default defineConfig([
  {
    ...shared,
    entry: { index: 'src/index.ts' },
    outDir: 'lib',
    format: 'esm',
    platform: 'node',
    dts: true,
  },
  {
    ...shared,
    entry: { client: 'src/client/index.tsx' },
    outDir: 'client',
    format: 'cjs',
    platform: 'browser',
    dts: false,
    external: ['react', 'react/jsx-runtime', 'react-dom'],
    plugins: [inlineCss()],
    outputOptions: {
      entryFileNames: 'client.js',
      banner: "window.__ModuleLoader__.load({ id: 'dsh-plaza', factory: (require) => { var module = { exports: {} }; var exports = module.exports;",
      footer: 'return module.exports; } });',
    },
    define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production') },
  },
])
