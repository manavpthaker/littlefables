// Kid surfaces: Home, Reader, Checkpoint, Chapter map. Art areas are gradient placeholders until real spreads exist.
const { Wordmark, Button, IconButton, Icon, Ornament, BookCard, Shelf, Buddy, Transport, MicOrb, ContinueCard, WordCapsule, TabBar, WordJar, StoryText, Checkpoint, ChoiceBlocks, ChapterMap, Sheet, ReaderTopBar, StorySpine, SunsRow, BadgeShelf, Celebration } = window.LittleFablesHeritageDS_bdeb10;
const ART={
 river:'linear-gradient(165deg,#3A4E63 0%,#2E4B3B 55%,#1E2A1C 100%)',
 market:'linear-gradient(160deg,#8A5A33 0%,#7D2E2B 60%,#3A1B18 100%)',
 night:'linear-gradient(170deg,#233450 0%,#1C2438 60%,#131722 100%)'
};
const PAGES=[
 {art:'river',text:'The fox tucked the letter beneath his velvet coat and bowed to the moon.'},
 {art:'night',text:'Rosa held the lantern higher, and the river kept her secret.'},
 {art:'market',text:'By morning the market smelled of bread, and the crow was waiting.'}
];
function KidHome({ onOpenBook, onTab, tab }){
  return <div style={{display:'flex',flexDirection:'column',height:'100%',background:'var(--paper)'}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 26px 6px'}}>
      <Wordmark markSize={40} animated/>
      <SunsRow total={5} earned={4} label="four suns"/>
    </div>
    <div style={{padding:'14px 26px 6px'}}><ContinueCard title="The Paper Boat" chapterLabel="chapter three · the river" progress={0.62} utterance="Shall we keep going?" onContinue={onOpenBook}/></div>
    <div style={{padding:'16px 26px 0',flex:1,overflow:'hidden',display:'flex',gap:24,alignItems:'flex-start'}}>
      <div style={{flex:1,minWidth:0}}><Shelf label="rosa's shelf">
        <BookCard title="The Paper Boat" childName="Rosa" progress={0.62} onOpen={onOpenBook} utterance="Back to the river?"/>
        <BookCard title="The Winter Key" childName="Rosa" isNew onOpen={onOpenBook} utterance="A brand new story!"/>
        <BookCard title="The Quiet Kite" childName="Rosa" progress={1} onOpen={onOpenBook} utterance="We finished this one together."/>
      </Shelf></div>
      <div style={{flex:'none',alignSelf:'flex-end',paddingBottom:18}}><Buddy state="idle" say="Tonight the river is waiting."/></div>
    </div>
    <TabBar activeId={tab||'shelf'} onSelect={onTab} items={[{id:'shelf',label:'shelf',icon:'book-open',utterance:'Your shelf.'},{id:'words',label:'words',icon:'bookmark',utterance:'Your word jar.'},{id:'suns',label:'suns',icon:'motif-sun',utterance:'Your sky of suns.'}]}/>
  </div>;
}
function KidReader({ onCheckpoint, onBack }){
  const [page,setPage]=React.useState(0);
  const [playing,setPlaying]=React.useState(true);
  const [wordIx,setWordIx]=React.useState(2);
  const [capsule,setCapsule]=React.useState(null);
  const words=PAGES[page].text.split(/\s+/);
  React.useEffect(()=>{
    if(!playing) return;
    const t=setInterval(()=>setWordIx(i=>{
      if(i+1>=words.length){ clearInterval(t); return i; }
      return i+1;
    }),520);
    return ()=>clearInterval(t);
  },[playing,page]);
  const go=(d)=>{ const n=page+d; if(n<0) return; if(n>=PAGES.length){ onCheckpoint(); return; } setPage(n); setWordIx(0); };
  return <div style={{position:'relative',height:'100%',background:ART[PAGES[page].art],overflow:'hidden'}}>
    <div style={{position:'absolute',inset:0,background:'radial-gradient(120% 60% at 70% 15%,rgba(243,235,216,0.14),transparent 60%)'}}></div>
    <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',height:'100%'}}>
      <ReaderTopBar chapterLabel="chapter three · the river" sunsLabel="four suns" onBack={onBack}/>
      <div style={{flex:1,display:'flex',alignItems:'flex-end',gap:18,padding:'0 22px 20px'}}>
        <div style={{flex:1,maxWidth:640}}>
          <StoryText overArt dropcap={page===0} text={PAGES[page].text} currentIndex={wordIx} onWordTap={(w)=>setCapsule(w)}/>
        </div>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'flex-end',gap:16}}>
          {capsule?<WordCapsule word={capsule} utterance={capsule+'.'} onStar={()=>setCapsule(null)}/>:null}
          <StorySpine progress={(page+1)/PAGES.length} height={170} ticks={[{at:0.33,done:page>=0},{at:0.66,done:page>=1}]}/>
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'center',gap:18,paddingBottom:22,alignItems:'center'}}>
        <Transport playing={playing} label={'page '+['one','two','three'][page]} onPlay={()=>setPlaying(p=>!p)} onBack={()=>go(-1)} onForward={()=>go(1)}/>
        <MicOrb state={playing?'idle':'listening'} onPress={()=>setPlaying(false)}/>
      </div>
    </div>
  </div>;
}
function KidCheckpoint({ onDone }){
  const [picked,setPicked]=React.useState(null);
  const [celebrate,setCelebrate]=React.useState(false);
  return <div style={{position:'relative',height:'100%',background:ART.night}}>
    <div style={{position:'absolute',inset:0,background:'var(--scrim-bottom)'}}></div>
    <div style={{position:'absolute',left:0,right:0,bottom:0,zIndex:1}}>
      <Sheet title="a question from the fox">
        {!celebrate?<Checkpoint question="Why did Rosa hide the lantern?" buddyState={picked?'speaking':'listening'}>
          <ChoiceBlocks choices={[{id:'a',label:"So the crow wouldn't see the light"},{id:'b',label:'Because it was too heavy'}]} pickedId={picked} onChoose={(id)=>{setPicked(id);setTimeout(()=>setCelebrate(true),700);}}/>
        </Checkpoint>
        :<div style={{display:'flex',justifyContent:'center',padding:'6px 0 10px'}}>
          <Celebration title="A sun for your sky" message="You finished chapter three." ceremonial>
            <Button onClick={onDone}>See the story map</Button>
          </Celebration>
        </div>}
      </Sheet>
    </div>
  </div>;
}
function KidMap({ onHome }){
  return <div style={{height:'100%',background:'var(--paper)',display:'flex',flexDirection:'column',padding:'22px 30px',gap:18,overflow:'auto'}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <h2 style={{fontSize:'var(--text-display-size)',lineHeight:'var(--text-display-lh)'}}>The Paper Boat</h2>
      <IconButton name="x" label="Back to the shelf" variant="outline" onClick={onHome}/>
    </div>
    <Ornament kind="rule-and-dot"/>
    <ChapterMap currentId="c4" chapters={[{id:'c1',label:'the letter',done:true},{id:'c2',label:'the market',done:true},{id:'c3',label:'the river',done:true},{id:'c4',label:'the crossing'},{id:'c5',label:'home again',locked:true}]}/>
    <div style={{display:'flex',gap:40,alignItems:'flex-start',marginTop:6}}>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <span className="lf-label" style={{color:'var(--ink-soft)'}}>your sky</span>
        <SunsRow total={5} earned={4} label="four suns"/>
        <BadgeShelf badges={[{id:'b1',label:'first story',icon:'motif-book',earned:true},{id:'b2',label:'word keeper',icon:'motif-key',earned:true},{id:'b3',label:'brave choice',icon:'motif-compass'}]}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10,alignItems:'center'}}>
        <span className="lf-label" style={{color:'var(--ink-soft)'}}>your words</span>
        <WordJar words={['beneath','velvet','lantern','harbor']} countLabel="four words"/>
      </div>
      <div style={{marginLeft:'auto'}}><Buddy state="idle" say="The crossing is next. Ready when you are."/></div>
    </div>
  </div>;
}
Object.assign(window,{ KidHome, KidReader, KidCheckpoint, KidMap });
