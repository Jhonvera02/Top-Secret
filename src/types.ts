export interface Character {
  id: string;
  name: string;
  universe: string;
  avatarEmoji: string;
  tagline: string;
  color: string;
}

export type Gender = 'Femenino' | 'Masculino' | 'No binario' | 'Otro' | 'Prefiero no decir';

export interface ParticipantPublicView {
  name: string;
  gender: Gender;
  character: Character;
  giftWish: string;
  sweetWish: string;
}

export interface AssignedFriendView {
  character: Character;
  gender: Gender;
  giftWish: string;
  sweetWish: string;
  // NOTE: Target real name is NEVER exposed!
}

export interface RevealResponse {
  participant: ParticipantPublicView;
  isRaffleCompleted: boolean;
  assignedFriend?: AssignedFriendView | null;
}

export interface AdminParticipant {
  id: string;
  name: string;
  gender: Gender;
  token: string;
  character: Character;
  giftWish: string;
  sweetWish: string;
  hasAssignment: boolean;
  registeredAt: string;
}

export interface SystemStatus {
  isLocked: boolean;
  totalParticipants: number;
  raffleCompletedAt: string | null;
}
