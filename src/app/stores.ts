import {
  wsActionTypes,
  wsApplications,
  wsBackups,
  wsCustomerTags,
  wsDevices,
  wsGeneral,
  wsNotificationEvents,
  wsOrganizations,
  wsPhoneNumbers,
  wsProfile,
  wsRingCentral,
  wsRoutingRules,
  wsSlaPolicies,
  wsTicketFields,
  wsZendesk,
  type ActionType,
  type Application,
  type BackupFile,
  type CustomerTag,
  type NotificationEvent,
  type Organization,
  type PhoneNumber,
  type RoutingRule,
  type SignedInDevice,
  type SlaPolicy,
  type TicketField,
  wsBrands,
  wsCannedReplyRecords,
  wsInvites,
  wsPermissions,
  wsTeamMembers,
  wsTeams,
  wsCategories,
  wsInventoryItems,
  wsLocations,
  wsNotes,
  wsSmsThreads,
  type CannedReplyRecord,
  type Invite,
  type PermissionRow,
  type Team,
  type TeamMember,
  type InventoryBrand,
  type InventoryCategory,
  type InventoryItem,
  type InventoryLocation,
  type KnowledgeNote,
  type SmsThread,
} from '@/mocks'
import { useCollection } from './collections-context'

/**
 * Session collections shared across pages. Keys are fixed here so a list edited on one page
 * (e.g. canned replies in Knowledge) is the same list read elsewhere (the ticket composer).
 */
export const useNotes = () => useCollection<KnowledgeNote>('notes', wsNotes)
export const useCannedReplies = () =>
  useCollection<CannedReplyRecord>('canned', wsCannedReplyRecords)
export const useSms = () => useCollection<SmsThread>('sms', wsSmsThreads)

export const useInventoryItems = () => useCollection<InventoryItem>('inv-items', wsInventoryItems)
export const useBrands = () => useCollection<InventoryBrand>('inv-brands', wsBrands)
export const useCategories = () => useCollection<InventoryCategory>('inv-categories', wsCategories)
export const useLocations = () => useCollection<InventoryLocation>('inv-locations', wsLocations)

export const useTeamMembers = () => useCollection<TeamMember>('team-members', wsTeamMembers)
export const useTeams = () => useCollection<Team>('teams', wsTeams)
export const usePermissions = () => useCollection<PermissionRow>('permissions', wsPermissions)
export const useInvites = () => useCollection<Invite>('invites', wsInvites)

export const useApplications = () => useCollection<Application>('applications', wsApplications)
export const useOrganizations = () => useCollection<Organization>('organizations', wsOrganizations)
export const useSlaPolicies = () => useCollection<SlaPolicy>('sla-policies', wsSlaPolicies)
export const useTicketFields = () => useCollection<TicketField>('ticket-fields', wsTicketFields)
export const useActionTypes = () => useCollection<ActionType>('action-types', wsActionTypes)
export const useCustomerTags = () => useCollection<CustomerTag>('customer-tags', wsCustomerTags)
export const useRoutingRules = () => useCollection<RoutingRule>('routing-rules', wsRoutingRules)
export const usePhoneNumbers = () => useCollection<PhoneNumber>('phone-numbers', wsPhoneNumbers)
export const useBackups = () => useCollection<BackupFile>('backups', wsBackups)
export const useDevices = () => useCollection<SignedInDevice>('devices', wsDevices)

/** A single settings document kept for the session (profile, general, integrations). */
function useDoc<T extends object>(key: string, seed: T) {
  const c = useCollection<T & { id: string }>(key, [{ ...seed, id: key }])
  const doc = c.items[0]!
  return [doc as T, (next: T) => c.replace([{ ...next, id: key }])] as const
}
export const useProfileDoc = () => useDoc('profile', wsProfile)
export const useGeneralDoc = () => useDoc('general', wsGeneral)
export const useZendeskDoc = () => useDoc('zendesk', wsZendesk)
export const useRingCentralDoc = () => useDoc('ringcentral', wsRingCentral)
export const useNotificationsDoc = () =>
  useDoc<{ events: NotificationEvent[]; quietHours: boolean }>('notifications', {
    events: wsNotificationEvents,
    quietHours: true,
  })
export const useSecurityDoc = () =>
  useDoc('security', { authenticator: true, backupCodes: false, passwordChanged: '3 months ago' })
export const useBackupDoc = () => useDoc('backup-settings', { nightly: true })
