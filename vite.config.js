import { defineConfig } from 'vite'

// CSS is authored in src/styles.css but inlined into index.html at build: this page is almost all
// first-visit paid traffic, and an external stylesheet measured ~200ms slower LCP (render-blocking).
const inlineCss = () => ({
  name: 'inline-css',
  apply: 'build',
  enforce: 'post',
  generateBundle(_, bundle) {
    const html = bundle['index.html']
    for (const file of Object.values(bundle)) {
      if (!file.fileName.endsWith('.css')) continue
      // url(../fonts/x) was relative to assets/; the page itself sits one level up.
      const css = file.source.replaceAll('url(../', 'url(./')
      html.source = html.source.replace(new RegExp(`<link[^>]*href="[^"]*${file.fileName}"[^>]*>`), () => `<style>${css}</style>`)
      delete bundle[file.fileName]
    }
  },
})

export default defineConfig({
  base: './',
  // Inlines the 7 KB mobile hero plate into the CSS; everything else lives in public/ and is never inlined.
  build: { assetsInlineLimit: 8192 },
  plugins: [inlineCss()],
})
