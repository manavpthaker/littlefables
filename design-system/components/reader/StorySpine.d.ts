export interface StorySpineBeat {
  /** the beat text, e.g. "Ember was scared of the dark" */
  label: string;
  /** covered by the child's retelling — develops sage with a filled check */
  hit?: boolean;
}

export interface StorySpineProps {
  /** ordered story beats; renders nothing when empty (retell still works) */
  beats: StorySpineBeat[];
}
