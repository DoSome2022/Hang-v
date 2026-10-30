'use client';

import { use } from 'react';
import CaseEditor from '../../_components/case-editor';

export default function CasesEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CaseEditor caseId={id} />;
}
