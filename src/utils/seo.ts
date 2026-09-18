/**
 * SEO Utility Service
 * Dynamically updates document title, meta tags, OpenGraph cards, Twitter preview,
 * and canonical URLs during application navigation for professional social shareability.
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const DEFAULT_SEO: SEOConfig = {
  title: 'Team Dark Devil - Enterprise Microjob & Worker Management Platform',
  description: 'Microjob, email sending, and SMS sending worker team management platform with real-time operations, job orchestration, and disaster recovery.',
  keywords: 'microjob, worker management, email sending platform, sms dispatch, team control center, neon postgresql, enterprise dashboard',
  image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
  url: typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-lozatwfxevs65ncglloty2-65114990346.asia-east1.run.app',
  type: 'website',
};

export function updatePageSEO(config?: Partial<SEOConfig>) {
  if (typeof document === 'undefined') return;

  const seo = { ...DEFAULT_SEO, ...config };

  // 1. Document Title
  document.title = seo.title;

  // 2. Meta Description
  let metaDesc = document.querySelector("meta[name='description']") as HTMLMetaElement;
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = seo.description;

  // 3. Meta Keywords
  if (seo.keywords) {
    let metaKeywords = document.querySelector("meta[name='keywords']") as HTMLMetaElement;
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = seo.keywords;
  }

  // 4. Canonical URL
  let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = seo.url || window.location.href;

  // 5. OpenGraph Tags
  const ogTags: Record<string, string> = {
    'og:title': seo.title,
    'og:description': seo.description,
    'og:type': seo.type || 'website',
    'og:url': seo.url || window.location.href,
    'og:image': seo.image || DEFAULT_SEO.image!,
  };

  Object.entries(ogTags).forEach(([property, content]) => {
    let tag = document.querySelector(`meta[property='${property}']`) as HTMLMetaElement;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.content = content;
  });

  // 6. Twitter Card Tags
  const twitterTags: Record<string, string> = {
    'twitter:card': 'summary_large_image',
    'twitter:title': seo.title,
    'twitter:description': seo.description,
    'twitter:image': seo.image || DEFAULT_SEO.image!,
  };

  Object.entries(twitterTags).forEach(([name, content]) => {
    let tag = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement;
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = name;
      document.head.appendChild(tag);
    }
    tag.content = content;
  });
}
