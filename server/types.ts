export interface Character {
  id: string;
  name: string;
  universe: string;
  avatarEmoji: string;
  tagline: string;
  color: string; // Tailwind color class or hex
}

export type Gender = 'Femenino' | 'Masculino' | 'No binario' | 'Otro' | 'Prefiero no decir';

export interface Participant {
  id: string;
  token: string; // Private secret link token
  name: string;
  gender: Gender;
  giftWish: string;
  sweetWish: string;
  character: Character;
  assignedFriendId?: string | null; // Id of the assigned participant
  registeredAt: string;
}

export interface GameState {
  isLocked: boolean;
  raffleCompletedAt: string | null;
  adminPin: string;
  participants: Participant[];
}

// Data exposed to participant via private link
export interface ParticipantRevealView {
  participant: {
    name: string;
    gender: Gender;
    character: Character;
    giftWish: string;
    sweetWish: string;
  };
  isRaffleCompleted: boolean;
  assignedFriend?: {
    character: Character;
    gender: Gender;
    giftWish: string;
    sweetWish: string;
    // NOTE: Name is deliberately OMITTED for confidentiality
  } | null;
}
