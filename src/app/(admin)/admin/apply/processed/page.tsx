'use client';

import ApplyTable from '../_components/apply-table';
import { PROCESSING_STATUSES } from '@/lib/constants';

export default function ApplyProcessedPage() {
  return <ApplyTable statuses={PROCESSING_STATUSES} />;
}
