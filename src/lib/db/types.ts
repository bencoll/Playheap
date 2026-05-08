import type { ColumnId } from '../../types';

export interface GameRow {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  hltb_gameplay_completionist: number | null;
  hltb_gameplay_main: number | null;
  hltb_gameplay_main_extra: number | null;
  hltb_id: string | null;
  hltb_image_url: string | null;
  columnId: ColumnId;
  platforms: string[] | null;
  position: number;
}

export interface TagRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export type GameRowWithTags = GameRow & {
  game_tags: { tags: { name: string } | null }[];
};

export interface GameInsertPayload {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  hltb_gameplay_completionist: number | null;
  hltb_gameplay_main: number | null;
  hltb_gameplay_main_extra: number | null;
  hltb_id: string | null;
  hltb_image_url: string | null;
  columnId: ColumnId;
  platforms: string[];
  position: number;
}

export interface GameUpdatePayload {
  title?: string;
  notes?: string | null;
  updated_at?: string;
  hltb_gameplay_completionist?: number | null;
  hltb_gameplay_main?: number | null;
  hltb_gameplay_main_extra?: number | null;
  hltb_id?: string | null;
  hltb_image_url?: string | null;
  platforms?: string[];
}
