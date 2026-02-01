import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * robust fix for scroll restoration issues.
 * 
 * Strategies used:
 * 1. useLayoutEffect: Fires synchronously after all DOM mutations but before paint.
 * 2. manual scrollRestoration: Tells the browser "back off, I'll handle scrolling".
 * 3. window.scrollTo(0, 0): The classic hammer.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        // 1. Disable browser's default scroll restoration
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        // 2. Force scroll to top immediately
        window.scrollTo(0, 0);

        // 3. Ensure body/html have no scroll offsets
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

    }, [pathname]);

    return null;
};

export default ScrollToTop;
