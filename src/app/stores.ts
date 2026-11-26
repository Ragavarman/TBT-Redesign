import {
  wsCannedReplyRecords,
  wsNotes,
  wsSmsThreads,
  type CannedReplyRecord,
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
