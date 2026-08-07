import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const createCrawlerFiles = (siteUrl: string): Plugin => ({
  name: 'generate-seo-files',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const normalizedUrl = siteUrl.replace(/\/$/, '')

      if (request.url === '/robots.txt') {
        response.setHeader('Content-Type', 'text/plain')
        response.end(`User-agent: *\nAllow: /\nDisallow: /login\nDisallow: /auth/\nDisallow: /onboarding\nDisallow: /referral-survey\nDisallow: /motivation-survey\nDisallow: /dashboard\nDisallow: /mi-perfil\nDisallow: /mis-citas\nDisallow: /psicologo/\nDisallow: /especialistas\nDisallow: /especialista/\n\nSitemap: ${normalizedUrl}/sitemap.xml\n`)
        return
      }

      if (request.url === '/sitemap.xml') {
        response.setHeader('Content-Type', 'application/xml')
        response.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${normalizedUrl}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`)
        return
      }

      next()
    })
  },
  generateBundle() {
    const normalizedUrl = siteUrl.replace(/\/$/, '')
    this.emitFile({
      type: 'asset',
      fileName: 'sitemap.xml',
      source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${normalizedUrl}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
    })
    this.emitFile({
      type: 'asset',
      fileName: 'robots.txt',
      source: `User-agent: *\nAllow: /\nDisallow: /login\nDisallow: /auth/\nDisallow: /onboarding\nDisallow: /referral-survey\nDisallow: /motivation-survey\nDisallow: /dashboard\nDisallow: /mi-perfil\nDisallow: /mis-citas\nDisallow: /psicologo/\nDisallow: /especialistas\nDisallow: /especialista/\n\nSitemap: ${normalizedUrl}/sitemap.xml\n`,
    })
  },
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = env.VITE_SITE_URL || 'http://localhost:5173'

  return {
    plugins: [react(), createCrawlerFiles(siteUrl)],
  }
})
