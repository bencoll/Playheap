import type { Game, HltbData } from '../../types';
import type {
  GameInsertPayload,
  GameRowWithTags,
  GameUpdatePayload,
} from './types';

export type GameWithPosition = Game & { position: number };

export function rowToGame(row: GameRowWithTags): GameWithPosition {
  const hltb: HltbData | undefined = row.hltb_id
    ? {
        hltbId: row.hltb_id,
        imageUrl: row.hltb_image_url ?? '',
        ...(row.hltb_gameplay_main != null && {
          gameplayMain: row.hltb_gameplay_main,
        }),
        ...(row.hltb_gameplay_main_extra != null && {
          gameplayMainExtra: row.hltb_gameplay_main_extra,
        }),
        ...(row.hltb_gameplay_completionist != null && {
          gameplayCompletionist: row.hltb_gameplay_completionist,
        }),
      }
    : undefined;

  const tags =
    row.game_tags
      ?.map((gt) => gt.tags?.name)
      .filter((name): name is string => typeof name === 'string') ?? [];

  return {
    id: row.id,
    title: row.title,
    columnId: row.columnId,
    platforms: row.platforms ?? [],
    createdAt: Date.parse(row.created_at),
    updatedAt: Date.parse(row.updated_at),
    position: row.position,
    ...(row.notes != null && { notes: row.notes }),
    ...(hltb && { hltb }),
    ...(tags.length > 0 && { tags }),
  };
}

export function gameToInsertPayload(
  game: Game,
  userId: string,
  position: number
): GameInsertPayload {
  return {
    id: game.id,
    user_id: userId,
    title: game.title,
    notes: game.notes ?? null,
    created_at: new Date(game.createdAt).toISOString(),
    updated_at: new Date(game.updatedAt).toISOString(),
    hltb_id: game.hltb?.hltbId ?? null,
    hltb_image_url: game.hltb?.imageUrl ?? null,
    hltb_gameplay_main: game.hltb?.gameplayMain ?? null,
    hltb_gameplay_main_extra: game.hltb?.gameplayMainExtra ?? null,
    hltb_gameplay_completionist: game.hltb?.gameplayCompletionist ?? null,
    columnId: game.columnId,
    platforms: game.platforms,
    position,
  };
}

export function gameUpdatesToPayload(
  updates: Partial<Pick<Game, 'title' | 'platforms' | 'hltb' | 'notes'>>
): GameUpdatePayload {
  const payload: GameUpdatePayload = {
    updated_at: new Date().toISOString(),
  };
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.notes !== undefined) payload.notes = updates.notes ?? null;
  if (updates.platforms !== undefined) payload.platforms = updates.platforms;
  if (updates.hltb !== undefined) {
    if (updates.hltb) {
      payload.hltb_id = updates.hltb.hltbId;
      payload.hltb_image_url = updates.hltb.imageUrl;
      payload.hltb_gameplay_main = updates.hltb.gameplayMain ?? null;
      payload.hltb_gameplay_main_extra = updates.hltb.gameplayMainExtra ?? null;
      payload.hltb_gameplay_completionist =
        updates.hltb.gameplayCompletionist ?? null;
    } else {
      payload.hltb_id = null;
      payload.hltb_image_url = null;
      payload.hltb_gameplay_main = null;
      payload.hltb_gameplay_main_extra = null;
      payload.hltb_gameplay_completionist = null;
    }
  }
  return payload;
}
