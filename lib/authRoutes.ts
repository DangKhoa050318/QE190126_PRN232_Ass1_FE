/** sessionStorage key used to prefill the login form right after registering. */
export const REGISTERED_EMAIL_KEY = "tasktrack.registeredEmail";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72; // BCrypt only uses the first 72 bytes

/**
 * Where to go after login: the protected page the user was sent away from (?next=...), otherwise /admin.
 * Only internal /admin and /profile paths are accepted, so the parameter cannot redirect to another site.
 */
export function afterLoginPath(next: string | null) {
  return next && /^\/(admin|profile)(\/|$|\?)/.test(next) ? next : "/admin";
}
