/**
 * Mock repository for actors (individual users & couples).
 *
 * デモではメモリ上のMock Dataを同期的に返す。
 * 本番では同一シグネチャのまま Supabase 実装（async化）に差し替える想定。
 */
import type { Actor, Couple, User } from "@/types";
import { mockCouples, mockUsers } from "@/data/mock";

const actorIndex = new Map<string, Actor>();
for (const u of mockUsers) actorIndex.set(u.id, u);
for (const c of mockCouples) actorIndex.set(c.id, c);

export function getActor(id: string): Actor | undefined {
  return actorIndex.get(id);
}

export function getUser(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function getCouple(id: string): Couple | undefined {
  return mockCouples.find((c) => c.id === id);
}

export function listUsers(): User[] {
  return mockUsers;
}

export function listCouples(): Couple[] {
  return mockCouples;
}

export function listActors(): Actor[] {
  return [...mockUsers, ...mockCouples];
}

export function searchActors(query: string, type?: Actor["type"]): Actor[] {
  const q = query.trim().toLowerCase();
  return listActors().filter((a) => {
    if (type && a.type !== type) return false;
    if (!q) return true;
    return (
      a.displayName.toLowerCase().includes(q) ||
      a.username.toLowerCase().includes(q) ||
      a.bio.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q)
    );
  });
}
