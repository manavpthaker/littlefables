import type { WorldBundle } from './types';
import { activeBuddy, type Buddy } from './buddy-roster';

// Deterministic buddy greeting composer. Given world + buddy + recent context,
// returns the utterance the Buddy speaks on Home mount + a coarse tone.
// Priority: welcome > callback (recent book) > word (saved yesterday) > streak > default.

export type GreetingTone = 'welcome' | 'callback' | 'word' | 'streak' | 'default';

export interface Greeting {
  utterance: string;
  tone: GreetingTone;
}

export function composeGreeting(bundle: WorldBundle, buddy: Buddy = activeBuddy(bundle.world.activeBuddyId)): Greeting {
  const name = buddy.name;
  const opened = bundle.world.growth.booksOpened;

  // Brand-new device.
  if (opened === 0 && bundle.recentWords.length === 0) {
    return {
      utterance: `Hi, I'm ${name}. Let's find a story to read together.`,
      tone: 'welcome',
    };
  }

  // World-memory callback — set when an interactive-page choice or notable
  // event landed. Takes precedence over the generic book-reading callback.
  if (bundle.world.latestCallback) {
    return {
      utterance: `${bundle.world.latestCallback}. Want to keep going?`,
      tone: 'callback',
    };
  }

  // Reading callback — the most recently opened book that isn't finished today.
  const lastBook = bundle.recentBooks[0];
  if (lastBook && lastBook.title) {
    return {
      utterance: `You were reading ${lastBook.title}. Want to keep going?`,
      tone: 'callback',
    };
  }

  // Word saved recently.
  const lastWord = bundle.recentWords[0];
  if (lastWord) {
    return {
      utterance: `You saved the word ${lastWord.word}. That's a great one!`,
      tone: 'word',
    };
  }

  // Streak. Reading days count (this week).
  const daysThisWeek = bundle.readingDays.length;
  if (daysThisWeek >= 3) {
    return {
      utterance: `${daysThisWeek} reading days this week — the sun is up!`,
      tone: 'streak',
    };
  }

  return {
    utterance: `Ready to read? ${buddy.catchphrase}`,
    tone: 'default',
  };
}
