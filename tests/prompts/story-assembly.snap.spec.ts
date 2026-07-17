import { describe, expect, it } from 'vitest';
import { assembleStoryPrompt } from '@/lib/prompts';

// Snapshot test: given fixed inputs, prompt output is stable. Canon changes
// intentionally shift the snapshot; unintentional changes are caught in review.
describe('assembleStoryPrompt', () => {
  it('produces a stable structure for a start prompt', () => {
    const out = assembleStoryPrompt({
      mode: 'start',
      child: { displayName: 'Azad', band: '4-8', excludeTerms: ['guns'], pronouns: 'he/him' },
      idea: 'Azad and the paper boat that could hear the rain',
    });

    // Not a full snapshot (canon is 100KB) — assert the structural contract instead.
    expect(out.canonVersion).toBeTruthy();
    expect(out.cacheKey).toContain('start');
    expect(out.cacheKey).toContain('4-8');
    expect(out.system).toContain('# 1. Role');
    expect(out.system).toContain('# 2. Universe canon');
    expect(out.system).toContain('# 3. Story creation instructions');
    expect(out.system).toContain('# 4. Evaluation rubric');
    expect(out.system).toContain('# 5. Hard constraints');
    expect(out.system).toContain('# 6. Output shape');
    expect(out.system).toContain('# 7. Canon version');
    expect(out.system).toContain('guns');
    expect(out.user).toContain('Azad');
    expect(out.user).toContain('band 4-8');
    expect(out.user).toContain('paper boat');
  });

  it('omits excludeTerms line when list is empty', () => {
    const out = assembleStoryPrompt({
      mode: 'start',
      child: { displayName: 'Azad', band: '4-8', excludeTerms: [] },
      idea: 'a walk to the park',
    });
    expect(out.system).toContain('No child-specific excluded terms');
  });

  it('weaves saved words + comprehension summary into the user prompt', () => {
    const out = assembleStoryPrompt({
      mode: 'chapter',
      child: { displayName: 'Azad', band: '4-8', excludeTerms: [] },
      idea: 'next chapter please',
      priorChapters: [{ title: 'The Beginning', pages: [{ text: 'once upon a time' }] }],
      savedWords: ['wiggly', 'lantern'],
      comprehensionSummary: 'strong recall, working on inference',
    });
    expect(out.user).toContain('wiggly, lantern');
    expect(out.user).toContain('strong recall');
    expect(out.user).toContain('The Beginning');
  });
});
