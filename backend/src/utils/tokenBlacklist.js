// Use Set to store invalidated JWTs
// In production you should use Redis, but this works for now.

const blacklist = new Set();

export const addTokenToBlacklist = (token) => {
  blacklist.add(token);
};

export const isTokenBlacklisted = (token) => {
  return blacklist.has(token);
};

export default blacklist;
