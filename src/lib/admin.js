// Site-admin check, tied specifically to one account rather than to
// whoever happens to own a given trip. Mirrored in firestore.rules
// (request.auth.token.email) — keep both in sync if this ever changes.
export const ADMIN_EMAIL = 'atlantaheller@gmail.com'

export function isSiteAdmin(user) {
  return Boolean(user?.email) && user.email === ADMIN_EMAIL
}
