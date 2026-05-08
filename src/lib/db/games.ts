import { supabase } from '../supabase';
import type { ColumnId, Game } from '../../types';
import {
  gameToInsertPayload,
  gameUpdatesToPayload,
  rowToGame,
  type GameWithPosition,
} from './mappers';
import type { GameRowWithTags } from './types';

export async function fetchGamesWithTags(): Promise<GameWithPosition[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*, game_tags(tags(name))')
    .order('position', { ascending: true });

  if (error) throw error;
  const rows = (data ?? []) as GameRowWithTags[];
  return rows.map(rowToGame);
}

export async function insertGame(
  game: Game,
  userId: string,
  position: number
): Promise<void> {
  const payload = gameToInsertPayload(game, userId, position);
  const { error } = await supabase.from('games').insert(payload);
  if (error) throw error;
}

export async function updateGameRow(
  id: string,
  updates: Partial<Pick<Game, 'title' | 'platforms' | 'hltb' | 'notes'>>
): Promise<void> {
  const payload = gameUpdatesToPayload(updates);
  const { error } = await supabase.from('games').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteGameRow(id: string): Promise<void> {
  const { error } = await supabase.from('games').delete().eq('id', id);
  if (error) throw error;
}

export async function moveGameRpc(
  gameId: string,
  targetColumn: ColumnId,
  targetIndex: number
): Promise<void> {
  const { error } = await supabase.rpc('move_game', {
    p_game_id: gameId,
    p_target_column: targetColumn,
    p_target_index: targetIndex,
  });
  if (error) throw error;
}
