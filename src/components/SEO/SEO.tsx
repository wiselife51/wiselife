import { useEffect } from 'react';

const siteUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');

const homeTitle = 'Psicología clínica profesional en Bogotá | Bienestar emocional';
const homeDescription =
  'Encuentra un espacio seguro, confidencial y profesional para cuidar tu salud mental y comenzar tu camino hacia el bienestar emocional en Bogotá o en sesiones online.';

const SEO = () => {
  useEffect(() => {
    document.title = homeTitle;

    const setMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    const setLink = (rel: string, href: string) => {
      let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
    };

    setMeta('description', homeDescription);
    setMeta('robots', 'index, follow');
    setMeta('og:title', homeTitle, 'property');
    setMeta('og:description', homeDescription, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:url', siteUrl, 'property');
    setMeta('og:locale', 'es_CO', 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', homeTitle);
    setMeta('twitter:description', homeDescription);
    setLink('canonical', siteUrl);
  }, []);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ProfessionalService',
          name: 'Psicología clínica profesional',
          description: homeDescription,
          url: siteUrl,
          areaServed: 'Bogotá, Colombia',
          serviceType: 'Psicología clínica',
          availableLanguage: 'Spanish',
        }),
      }}
    />
  );
};

export default SEO;
