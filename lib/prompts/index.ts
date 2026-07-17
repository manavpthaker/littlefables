// Public API surface of the prompt package. Everything the Phase 3 story engine
// (and the pack pipeline in Phase 4) imports comes through this file.

export { CANON_VERSION } from './version';
export { aziVerse, characterBible } from './canon';
export {
  assembleStoryPrompt,
  type AssemblyInput,
  type AssembledPrompt,
  type StoryMode,
} from './templates/story-assembly';
export {
  runStage0,
  decideStatus,
  RUBRIC_WEIGHTS,
  MAX_GEN_ATTEMPTS,
  type HardGate,
  type QAStatus,
  type QAOutcome,
  type RubricDimension,
  type Stage0Result,
} from './templates/qa-gates';
