import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Resets scroll to the top whenever the route path changes, so navigating to a
// dedicated page (About, Pricing, …) starts at the top. When the URL carries a
// hash (e.g. #contact) we leave scrolling to the browser's native anchor jump.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
