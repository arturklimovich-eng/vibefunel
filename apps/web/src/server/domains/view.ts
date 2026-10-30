import 'server-only';
import { txtRecordName, txtRecordValue } from '@/lib/domains';
import type { DomainView } from '@/lib/domains';
import type { CustomDomain } from '@/server/funnel-repository';

export function toDomainView(domain: CustomDomain): DomainView {
  return {
    id: domain.id,
    funnelId: domain.funnelId,
    hostname: domain.hostname,
    status: domain.status,
    verifiedAt: domain.verifiedAt,
    lastCheckedAt: domain.lastCheckedAt,
    lastError: domain.lastError,
    createdAt: domain.createdAt,
    txtName: txtRecordName(domain.hostname),
    txtValue: txtRecordValue(domain.verificationToken),
  };
}
