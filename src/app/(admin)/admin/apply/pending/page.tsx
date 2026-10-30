'use client';

import ApplyTable from '../_components/apply-table';
import { PENDING_STATUSES } from '@/lib/constants';

export default function ApplyPendingPage() {
  return <ApplyTable statuses={PENDING_STATUSES} />;
}
