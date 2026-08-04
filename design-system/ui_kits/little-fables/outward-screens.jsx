// Outward surfaces: Etsy hero, Pinterest pin, gift certificate, coloring page, email preview. All static.
const { MarketingHero, TrustRow, GiftCertificate, ColoringPage, EmailShell, EtsyHero, PinterestPin, BuyerFooter, Button } = window.LittleFablesHeritageDS_bdeb10;
function Outward(){
  const [view,setView]=React.useState('landing');
  const [emailVariant,setEmailVariant]=React.useState('delivery');
  const tabs=[['landing','Landing'],['etsy','Etsy hero'],['pin','Pinterest pin'],['cert','Gift certificate'],['coloring','Coloring page'],['email','Email']];
  return <div data-density="outward" style={{height:'100%',overflow:'auto',background:'var(--paper-deep)'}}>
    <div style={{position:'sticky',top:0,zIndex:2,display:'flex',gap:6,padding:'10px 16px',background:'var(--paper)',borderBottom:'1px solid var(--border-soft)',flexWrap:'wrap'}}>
      {tabs.map(([id,label])=><button key={id} onClick={()=>setView(id)} style={{fontFamily:'var(--font-sc)',fontSize:13,letterSpacing:'0.07em',padding:'7px 14px',borderRadius:999,border:'1px solid '+(view===id?'var(--ink)':'var(--border-soft)'),background:view===id?'var(--brass-wash)':'transparent',color:'var(--ink)',cursor:'pointer'}}>{label}</button>)}
    </div>
    <div style={{padding:24,display:'flex',flexDirection:'column',alignItems:'center',gap:24}}>
      {view==='landing'?<div style={{background:'var(--paper)',boxShadow:'var(--shadow-raised)',maxWidth:920,width:'100%'}}>
        <MarketingHero secondaryCta="Read a sample"/><TrustRow/><BuyerFooter/>
      </div>:null}
      {view==='etsy'?<div style={{width:1350*0.58,height:1012*0.58,overflow:'hidden',boxShadow:'var(--shadow-raised)'}}><EtsyHero scale={0.58}/></div>:null}
      {view==='pin'?<div style={{width:1000*0.42,height:1500*0.42,overflow:'hidden',boxShadow:'var(--shadow-raised)'}}><PinterestPin scale={0.42}/></div>:null}
      {view==='cert'?<div style={{background:'var(--paper)',padding:24,boxShadow:'var(--shadow-raised)'}}><GiftCertificate/></div>:null}
      {view==='coloring'?<div style={{width:560,boxShadow:'var(--shadow-raised)'}}><ColoringPage/></div>:null}
      {view==='email'?<div style={{display:'flex',flexDirection:'column',gap:14,alignItems:'center'}}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
          {['intake-ack','preview-delivery','delivery','checkin','review-request'].map(v=><button key={v} onClick={()=>setEmailVariant(v)} style={{fontFamily:'var(--font-sc)',fontSize:12,letterSpacing:'0.06em',padding:'6px 12px',borderRadius:999,border:'1px solid '+(emailVariant===v?'var(--ink)':'var(--border-soft)'),background:emailVariant===v?'var(--brass-wash)':'var(--paper)',cursor:'pointer',color:'var(--ink)'}}>{v}</button>)}
        </div>
        <div style={{width:640,boxShadow:'var(--shadow-raised)'}}><EmailShell variant={emailVariant} markSrc="../../assets/brand/mark-ink.png"/></div>
      </div>:null}
    </div>
  </div>;
}
Object.assign(window,{ Outward });
