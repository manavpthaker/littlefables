import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Google Fonts are fetched at render time; give them room to arrive.
Config.setDelayRenderTimeoutInMilliseconds(60000);
