import { supabase } from '../supabase';
import type { TagRow } from './types';

export interface TagRecord {
  id: string;
  name: string;
}

export async function fetchTags(): Promise<TagRecord[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('id, name')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as TagRecord[];
}

export async function upsertTag(
  name: string,
  userId: string
): Promise<TagRecord> {
  const trimmed = name.trim();
  const { data, error } = await supabase
    .from('tags')
    .upsert(
      { user_id: userId, name: trimmed },
      { onConflict: 'user_id,name', ignoreDuplicates: false }
    )
    .select('id, name')
    .single();

  if (error) throw error;
  return data as TagRecord;
}

export async function deleteTagByName(name: string): Promise<void> {
  const { error } = await supabase.from('tags').delete().eq('name', name);
  if (error) throw error;
}

export async function resolveTagIdsByName(
  names: string[],
  userId: string
): Promise<Map<string, string>> {
  if (names.length === 0) return new Map();

  const { data: existing, error: fetchError } = await supabase
    .from('tags')
    .select('id, name')
    .in('name', names);
  if (fetchError) throw fetchError;

  const result = new Map<string, string>();
  for (const tag of (existing ?? []) as TagRow[]) {
    result.set(tag.name, tag.id);
  }

  const missing = names.filter((n) => !result.has(n));
  if (missing.length > 0) {
    const { data: created, error: insertError } = await supabase
      .from('tags')
      .upsert(
        missing.map((name) => ({ user_id: userId, name })),
        { onConflict: 'user_id,name' }
      )
      .select('id, name');
    if (insertError) throw insertError;
    for (const tag of (created ?? []) as TagRow[]) {
      result.set(tag.name, tag.id);
    }
  }

  return result;
}

export async function setGameTags(
  gameId: string,
  oldNames: string[],
  newNames: string[],
  userId: string
): Promise<void> {
  const oldSet = new Set(oldNames);
  const newSet = new Set(newNames);
  const toAdd = newNames.filter((n) => !oldSet.has(n));
  const toRemove = oldNames.filter((n) => !newSet.has(n));

  if (toAdd.length > 0) {
    const ids = await resolveTagIdsByName(toAdd, userId);
    const rows = toAdd
      .map((name) => ids.get(name))
      .filter((id): id is string => typeof id === 'string')
      .map((tag_id) => ({ game_id: gameId, tag_id }));
    if (rows.length > 0) {
      const { error } = await supabase
        .from('game_tags')
        .upsert(rows, { onConflict: 'game_id,tag_id', ignoreDuplicates: true });
      if (error) throw error;
    }
  }

  if (toRemove.length > 0) {
    const { data: tagRows, error: lookupError } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', toRemove);
    if (lookupError) throw lookupError;
    const removeIds = (tagRows ?? []).map((t) => (t as TagRow).id);
    if (removeIds.length > 0) {
      const { error } = await supabase
        .from('game_tags')
        .delete()
        .eq('game_id', gameId)
        .in('tag_id', removeIds);
      if (error) throw error;
    }
  }
}
