// Parent Corner: Tonight, Orders, Settings — data-density="parent", never bedtime.
const { Wordmark, Button, Icon, ParentTabs, SectionHeader, CheckpointTranscript, ComprehensionProfile, RetellingPlayer, ChoiceRecord, ListRow, Field, TextInput, LifecycleChip, ArtApproval, StateBanner, Rule } = window.LittleFablesHeritageDS_bdeb10;
function ParentCorner(){
  const [tab,setTab]=React.useState('tonight');
  return <div data-density="parent" style={{height:'100%',overflow:'auto',background:'var(--paper)',fontSize:'var(--text-body-size)'}}>
    <div style={{maxWidth:760,margin:'0 auto',padding:'26px 32px 48px',display:'flex',flexDirection:'column',gap:18}}>
      <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between'}}>
        <h1 style={{fontSize:'var(--text-display-size)'}}>Parent Corner</h1>
        <Wordmark markSize={26}/>
      </div>
      <ParentTabs tabs={[{id:'tonight',label:'Tonight'},{id:'orders',label:'Orders'},{id:'settings',label:'Settings'}]} activeId={tab} onSelect={setTab}/>
      {tab==='tonight'?<div style={{display:'flex',flexDirection:'column',gap:22}}>
        <StateBanner kind="syncing" message="Tonight's reading is saved to this iPad and syncing quietly."/>
        <SectionHeader label="checkpoints · chapter three"/>
        <CheckpointTranscript title="The river" date="April 12, 7:40–7:55pm" records={[
          {question:'Why did Rosa hide the lantern?',answer:"So the crow wouldn't see the light.",meta:'first try · 7:42pm'},
          {question:'What was in the letter?',answer:'A map to the crossing.',meta:'after one hint · 7:48pm'},
          {question:'What do you think happens at the crossing?',answer:'The crow helps them because they were kind.',meta:'open answer · 7:53pm'}]}/>
        <ChoiceRecord where="at the river crossing" chose="Chose to help the crow" alternative="Cross alone"/>
        <SectionHeader label="retelling"/>
        <p style={{color:'var(--ink-soft)'}}>Rosa retold the chapter in her own words. Sequence was complete; she added a reason the crow was afraid.</p>
        <RetellingPlayer progress={0.4} duration="1:12"/>
        <SectionHeader label="comprehension signals"/>
        <ComprehensionProfile skills={[{label:'Sequence',level:0.8,word:'steady'},{label:'Why & because',level:0.55,word:'growing'},{label:'New words kept',level:0.7,word:'steady'},{label:'Prediction',level:0.62,word:'growing'}]}/>
        <p style={{fontSize:'var(--text-caption-size)',color:'var(--ink-faint)'}}>Signals come from checkpoint answers and retellings — evidence, not scores.</p>
      </div>:null}
      {tab==='orders'?<div style={{display:'flex',flexDirection:'column',gap:18}}>
        <SectionHeader label="order lf-2041 · rosa's second book"/>
        <div style={{display:'flex',gap:10,alignItems:'center'}}><LifecycleChip state="needsReview"/><span style={{fontSize:'var(--text-caption-size)',color:'var(--ink-faint)'}}>2 of 10 spreads awaiting your eye</span></div>
        <ArtApproval title="Cover — Rosa and the lantern" note="Style: lantern-lit watercolor · cover" state="needsReview"/>
        <ArtApproval title="Spread four — the market at dawn" note="Style: lantern-lit watercolor · spread four" state="checking"/>
        <SectionHeader label="earlier orders"/>
        <div><ListRow label="The Paper Boat" sub="Delivered March 2 · read nine times" value={<LifecycleChip state="published"/>}/>
        <ListRow label="The Quiet Kite" sub="Delivered January 18 · finished" value={<LifecycleChip state="published"/>}/></div>
      </div>:null}
      {tab==='settings'?<div style={{display:'flex',flexDirection:'column',gap:18}}>
        <SectionHeader label="reading"/>
        <div>
          <ListRow icon="motif-moon" label="Bedtime mode" sub="Dark walnut surface after this hour" value="7:00 pm"/>
          <ListRow icon="volume-2" label="Narration voice" value="Warm & low"/>
          <ListRow icon="motif-sun" label="Lighting" sub="Paper follows the time of day" value="On"/>
          <ListRow icon="mic" label="Checkpoint questions" sub="Spoken, two per chapter" value="Gentle"/>
        </div>
        <SectionHeader label="the reader"/>
        <Field label="child's name" help="Used on the cover and inside the story."><TextInput value="Rosa"/></Field>
        <Field label="name we speak" help="How the narrator says it."><TextInput value="ROH-sah"/></Field>
        <SectionHeader label="privacy"/>
        <p style={{color:'var(--ink-soft)'}}>We delete your intake once your book is delivered — unless you say otherwise.</p>
        <div><Button variant="secondary" size="compact">Download Rosa's data</Button></div>
      </div>:null}
    </div>
  </div>;
}
Object.assign(window,{ ParentCorner });
