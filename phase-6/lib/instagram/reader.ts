export interface ProfileSignals {
  username: string;
  fullName?: string;
  bio?: string;
  followerCount?: string;
  isPrivate?: boolean;
}

export function normaliseHandle(input?: string | null): string | null {
  if (!input) return null;
  let handle = input.trim();

  // Strip full URLs (e.g. https://instagram.com/user/)
  handle = handle.replace(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\//i, '');
  // Strip query parameters or trailing slashes
  handle = handle.split(/[?#/]/)[0];
  // Strip leading @
  handle = handle.replace(/^@+/, '').trim();

  // Validate format: alphanumeric, dot, underscore, max 30 chars
  if (/^[a-zA-Z0-9._]{1,30}$/.test(handle)) {
    return handle.toLowerCase();
  }
  return null;
}

export async function readProfileSignals(handle: string): Promise<ProfileSignals | null> {
  const cleanHandle = normaliseHandle(handle);
  if (!cleanHandle) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4 second hard cap

    const res = await fetch(`https://www.instagram.com/${cleanHandle}/`, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return { username: cleanHandle };
    }

    const html = await res.text();

    // Extract meta title and description if exposed in public HTML
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/i);
    const descMatch = html.match(/<meta property="og:description" content="([^"]*)"/i);

    const fullName = titleMatch ? titleMatch[1].split('(@')[0].trim() : undefined;
    const desc = descMatch ? descMatch[1] : undefined;

    // Extract follower count from og:description if present (e.g., "12K Followers...")
    let followerCount: string | undefined;
    if (desc) {
      const followersMatch = desc.match(/([\d.]+[KM]?)\s*Followers/i);
      if (followersMatch) {
        followerCount = followersMatch[1];
      }
    }

    return {
      username: cleanHandle,
      fullName,
      bio: desc,
      followerCount,
    };
  } catch (err) {
    // Graceful fallback: Never throw, always return basic username
    return { username: cleanHandle };
  }
}
