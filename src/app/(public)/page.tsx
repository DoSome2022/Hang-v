// src/app/page.tsx

import Home from '@/components/home';
import { company, faqs, services, siteUrl } from '@/lib/site';

export default function Page() {
  const organizationId = siteUrl ? `${siteUrl}/#organization` : '#organization';
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', 
        '@id': organizationId, 
        name: company.name, 
        alternateName: company.englishName, 
        description: company.description, 
        foundingDate: '2023', ...(siteUrl ? { url: siteUrl, logo: `${siteUrl}/icon.svg` } : {}), 
        areaServed: { '@type': 'Place', name: 'Hong Kong' }, 
        knowsAbout: ['Artificial Intelligence', 'Workflow Automation', 'DevOps', 'Cloud Computing', 
                      'Cybersecurity', 'Web Development'] },
      { '@type': 'WebSite', 
        '@id': siteUrl ? `${siteUrl}/#website` : '#website', 
        name: '實瀚科技 HANGS', ...(siteUrl ? { url: siteUrl } : {}), 
        inLanguage: 'zh-Hant', publisher: { '@id': organizationId } },
        ...services.map(service => ({ '@type': 'Service', 
        name: service.title, description: service.detail, 
        serviceType: service.english, provider: { '@id': organizationId }, 
        ...(siteUrl ? { url: `${siteUrl}/#services` } : {}), areaServed: 'Hong Kong' })),
      { '@type': 'FAQPage', mainEntity: faqs.map(faq => ({ '@type': 'Question', 
        name: faq.question, 
        acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) },
    ],
  };
  return <>
  <script type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
  <Home />
  </>;
}
