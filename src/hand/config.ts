export enum HandType {
  "SECRET" = "SECRET",
  "DEFENSE" = "DEFENSE",
  "PLAYER" = "PLAYER",
}

export type HandConfig = {
  type: HandType
  limit?: number,
  priority: number,
  min?: number,
};

export type HandConfigMap = {
  [key in HandType]: HandConfig
}

const Config: HandConfigMap = {
  [HandType.SECRET]: { type: HandType.SECRET, "limit": 3, "priority": 2 },
  [HandType.DEFENSE]: { type: HandType.DEFENSE, "limit": 3, "priority": 1 },
  [HandType.PLAYER]: { type: HandType.PLAYER, "min": 3, "priority": 0 }
};

export default Config;
