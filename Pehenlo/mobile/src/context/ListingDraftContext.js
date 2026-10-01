import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { listingService } from '../services/listingService';
import { useAuth } from '../hooks/useAuth';
import {
  createEmptyDraft,
  draftFromListing,
  draftToPayload,
} from '../utils/listingHelpers';

const STORAGE_KEY = 'pehenlo.listingDrafts.v1';
const ListingDraftContext = createContext(null);

async function readStore() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      activeLocalId: parsed?.activeLocalId || null,
      drafts: Array.isArray(parsed?.drafts) ? parsed.drafts : [],
    };
  } catch (_error) {
    return { activeLocalId: null, drafts: [] };
  }
}

export function ListingDraftProvider({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [ready, setReady] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [activeLocalId, setActiveLocalId] = useState(null);
  const [syncError, setSyncError] = useState('');

  const persist = useCallback(async (nextDrafts, nextActiveId) => {
    setDrafts(nextDrafts);
    setActiveLocalId(nextActiveId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      drafts: nextDrafts,
      activeLocalId: nextActiveId,
    }));
  }, []);

  const refreshDrafts = useCallback(async () => {
    const stored = await readStore();
    let serverDrafts = [];
    try {
      const response = await listingService.getMyListings();
      serverDrafts = (response?.data?.listings || [])
        .filter((listing) => listing.status === 'DRAFT' || listing.status === 'REJECTED')
        .map(draftFromListing);
    } catch (_error) {
      serverDrafts = [];
    }
    const byId = new Map();
    stored.drafts.forEach((draft) => {
      byId.set(draft.id || draft.localId, draft);
    });
    serverDrafts.forEach((draft) => {
      const local = byId.get(draft.id);
      if (!local || (draft.updatedAt || 0) >= (local.updatedAt || 0)) {
        byId.set(draft.id, { ...local, ...draft, localId: local?.localId || draft.id });
      }
    });
    const merged = [...byId.values()].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    await persist(merged, stored.activeLocalId);
    setReady(true);
  }, [persist]);

  useEffect(() => {
    if (isLoading) return undefined;
    if (!isAuthenticated) {
      setReady(true);
      return undefined;
    }
    refreshDrafts();
    return undefined;
  }, [isAuthenticated, isLoading, refreshDrafts]);

  const activeDraft = drafts.find((draft) => draft.localId === activeLocalId) || null;

  const updateDraft = useCallback(async (patch) => {
    const current = drafts.find((draft) => draft.localId === activeLocalId) || createEmptyDraft(user);
    const next = { ...current, ...patch, updatedAt: Date.now() };
    const others = drafts.filter((draft) => draft.localId !== next.localId);
    await persist([next, ...others], next.localId);
    return next;
  }, [activeLocalId, drafts, persist, user]);

  const startNewDraft = useCallback(async () => {
    const next = createEmptyDraft(user);
    await persist([next, ...drafts], next.localId);
    return next;
  }, [drafts, persist, user]);

  const continueDraft = useCallback(async (draft) => {
    await persist(drafts, draft.localId);
    return draft;
  }, [drafts, persist]);

  const syncDraft = useCallback(async (patch = {}) => {
    const current = drafts.find((draft) => draft.localId === activeLocalId) || createEmptyDraft(user);
    const next = { ...current, ...patch, updatedAt: Date.now() };
    setSyncError('');
    try {
      const payload = draftToPayload(next);
      const response = next.id
        ? await listingService.updateListing(next.id, payload)
        : await listingService.createListing(payload);
      const saved = draftFromListing(response.data.listing);
      const merged = {
        ...next,
        ...saved,
        localId: next.localId,
        photos: next.photos.length ? next.photos : saved.photos,
        updatedAt: Date.now(),
      };
      const others = drafts.filter((draft) => draft.localId !== next.localId && draft.id !== merged.id);
      await persist([merged, ...others], merged.localId);
      return merged;
    } catch (error) {
      const others = drafts.filter((draft) => draft.localId !== next.localId);
      await persist([next, ...others], next.localId);
      setSyncError(error?.message || 'Couldn’t save your draft. It is still on this phone.');
      throw error;
    }
  }, [activeLocalId, drafts, persist, user]);

  const submitActiveDraft = useCallback(async () => {
    const saved = await syncDraft();
    const response = await listingService.submitListing(saved.id);
    const remaining = drafts.filter((draft) => draft.localId !== saved.localId && draft.id !== saved.id);
    await persist(remaining, null);
    return response.data;
  }, [drafts, persist, syncDraft]);

  const value = useMemo(() => ({
    ready,
    drafts: drafts.filter((draft) => draft.status !== 'PENDING_APPROVAL'),
    activeDraft,
    syncError,
    refreshDrafts,
    updateDraft,
    startNewDraft,
    continueDraft,
    syncDraft,
    submitActiveDraft,
  }), [
    ready, drafts, activeDraft, syncError, refreshDrafts,
    updateDraft, startNewDraft, continueDraft, syncDraft, submitActiveDraft,
  ]);

  return (
    <ListingDraftContext.Provider value={value}>
      {children}
    </ListingDraftContext.Provider>
  );
}

export function useListingDraft() {
  const context = useContext(ListingDraftContext);
  if (!context) {
    throw new Error('useListingDraft must be used within ListingDraftProvider');
  }
  return context;
}

export default ListingDraftContext;
