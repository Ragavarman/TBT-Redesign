import {
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
