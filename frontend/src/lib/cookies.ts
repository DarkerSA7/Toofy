/**
 * Cookie utility functions for client-side cookie management
 */

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const nameEQ = name + '='
  const cookies = document.cookie.split(';')

  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }

  return null
}

/**
 * Set a cookie with optional expiration
 */
export function setCookie(
  name: string,
  value: string,
  maxAge?: number,
  path: string = '/'
): void {
  if (typeof document === 'undefined') {
    return
  }

  let cookieString = `${name}=${encodeURIComponent(value)}`

  if (maxAge) {
    cookieString += `; max-age=${maxAge}`
  }

  cookieString += `; path=${path}`

  document.cookie = cookieString
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${name}=; max-age=0; path=${path}`
}

/**
 * Clear all cookies
 */
export function clearAllCookies(): void {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim()
    if (name) {
      deleteCookie(name)
    }
  })
}
