import type { Status } from "../../../../IO/display/Display";

export type TableDisplayFunc = (
  status: Status,
  showBothHands: boolean,
) => void;