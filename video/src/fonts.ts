import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { FONT_FACES } from './fontFaces';

// Remotion renders in a headless browser with no fonts of its own, so the film
// has to load IM Fell English and EB Garamond itself.
//
// Two things this got wrong before, both worth keeping written down:
//
// 1. The fonts were fetched from Google. Remotion renders across many parallel
//    workers, each a fresh page making the same request, and Google rate-limits
//    that. It surfaces as a delayRender timeout two thirds through a render,
//    nothing resembling a network error. They are bundled now.
//
// 2. delayRender() was called at module scope. Remotion wants it inside a
//    component, tied to that component's lifecycle — called during import it
//    registers against a handle the renderer never reconciles, and the render
//    stalls until it times out.

export const useHeritageFonts = () => {
  const [handle] = useState(() => delayRender('Loading Heritage fonts'));

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      continueRender(handle);
    };

    const style = document.createElement('style');
    style.textContent = FONT_FACES.replace(
      /FONTBASE/g,
      staticFile('fonts/x.woff2').replace(/\/x\.woff2$/, ''),
    );
    document.head.appendChild(style);

    document.fonts.ready.then(finish).catch(finish);
    // Wrong fonts beat no render.
    const timer = setTimeout(finish, 10000);

    return () => {
      clearTimeout(timer);
      finish();
    };
  }, [handle]);
};
