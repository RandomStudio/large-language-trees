import type { PublicUserInfo, SelectUser } from "./types";

export const stripUserInfo = (user: SelectUser): PublicUserInfo => ({
  id: user.id,
  username: user.username
});
