Prompt-first story maker — one big textarea (typed or spoken), one length toggle with a default, one terracotta "Make it". The collapsed "+ more control" is the only extra affordance; there is no wizard.
```jsx
<StoryMaker onMake={({prompt,length})=>generate(prompt,length)} onSpeak={openMic} />
```
