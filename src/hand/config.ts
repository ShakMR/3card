export enum HandType {
  "SECRET" = "SECRET",
  "DEFENSE" = "DEFENSE",
  "PLAYER" = "PLAYER",
}

export type HandConfig = {
  limit?: number,
  priority: number,
  min?: number,
};

export type HandConfigMap = {
  [key in HandType]: HandConfig
}

const Config: HandConfigMap = {
  "SECRET": { "limit": 3, "priority": 2 },
  "DEFENSE": { "limit": 3, "priority": 1 },
  "PLAYER": { "min": 3, "priority": 0 }
};

export default Config;
