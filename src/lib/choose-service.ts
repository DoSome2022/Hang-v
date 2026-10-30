import { services } from './site';
import { categories } from './service-catalog';

export type ChooseOption = { slug: string; title: string; english: string; href: string };
export type ChooseGroup = { cardId: string; options: ChooseOption[] };

const groups: Record<string, string[]> = {
  ai: ['ai-chatbot', 'knowledge-base', 'document-processing', 'ai-agents'],
  'business-ai': ['ai-workshop', 'python-api-training', 'capability-transfer'],
  automation: ['rpa-automation', 'system-integration', 'approval-workflow'],
  cloud: ['cloud-migration', 'container-cicd', 'monitoring-ops'],
  platform: ['security-testing', 'vulnerability-remediation', 'access-security', 'web-ecommerce', 'crm-erp', 'iot-data'],
};

const catalogBySlug = new Map<string, ChooseOption>();
for (const category of categories) {
  for (const service of category.services) {
    catalogBySlug.set(service.slug, { slug: service.slug, title: service.title, english: service.english, href: `/services/${category.slug}/${service.slug}` });
  }
}

export const chooseGroups: ChooseGroup[] = services.map(service => ({
  cardId: service.id,
  options: (groups[service.id] ?? []).map(slug => catalogBySlug.get(slug) ?? { slug, title: slug, english: '', href: '/services' }),
}));

export const allOptions: ChooseOption[] = chooseGroups.flatMap(group => group.options);
