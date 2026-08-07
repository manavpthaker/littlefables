// Little Fables pin renderer — brand tokens from design-system/tokens
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const A = p => 'file://' + path.join(ROOT, 'assets', p);
const F = p => 'file://' + path.join(ROOT, 'node_modules', p);
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const CSS = `
@font-face{font-family:'IM Fell English';src:url('${F('@fontsource/im-fell-english/files/im-fell-english-latin-400-normal.woff2')}') format('woff2');font-weight:400;font-style:normal}
@font-face{font-family:'IM Fell English';src:url('${F('@fontsource/im-fell-english/files/im-fell-english-latin-400-italic.woff2')}') format('woff2');font-weight:400;font-style:italic}
@font-face{font-family:'IM Fell English SC';src:url('${F('@fontsource/im-fell-english-sc/files/im-fell-english-sc-latin-400-normal.woff2')}') format('woff2');font-weight:400}
@font-face{font-family:'EB Garamond';src:url('${F('@fontsource/eb-garamond/files/eb-garamond-latin-400-normal.woff2')}') format('woff2');font-weight:400}
@font-face{font-family:'EB Garamond';src:url('${F('@fontsource/eb-garamond/files/eb-garamond-latin-500-normal.woff2')}') format('woff2');font-weight:500}
@font-face{font-family:'EB Garamond';src:url('${F('@fontsource/eb-garamond/files/eb-garamond-latin-600-normal.woff2')}') format('woff2');font-weight:600}
:root{
--paper:#EDE3CE;--paper-warm:#F3EBD8;--paper-deep:#D9C7A2;
--ink:#2A1D12;--ink-soft:#57432E;--ink-faint:#8A7156;
--oxblood:#7D2E2B;--brass:#A67C3A;--forest:#2E4B3B;--gilt:#B89154;--navy:#233450;--burgundy:#5A2229;
--text-on-art:#F3EBD8;
--scrim-bottom:linear-gradient(to top,rgba(26,18,10,0.78),rgba(26,18,10,0.40) 55%,rgba(26,18,10,0) 100%);
--border-ornament:rgba(42,29,18,0.20);
}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1000px;height:1500px;overflow:hidden}
.pin{width:1000px;height:1500px;background:var(--paper);display:flex;flex-direction:column;position:relative;font-family:'EB Garamond',serif;color:var(--ink)}

/* footer signature — every pin */
.foot{background:var(--paper);padding:30px 60px 40px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center}
.foot-rule{width:180px;height:1px;background:var(--border-ornament);position:relative}
.foot-rule::after{content:"";position:absolute;left:50%;top:-3px;width:7px;height:7px;transform:translateX(-50%) rotate(45deg);background:var(--gilt)}
.wordmark{display:flex;align-items:center;gap:16px}
.wordmark img{width:52px;height:52px;object-fit:contain}
.wordmark span{font-family:'IM Fell English',serif;font-size:38px;color:var(--ink)}
.site{font-family:'IM Fell English SC',serif;font-size:22px;letter-spacing:0.14em;color:var(--brass)}

/* eyebrow */
.eyebrow{font-family:'IM Fell English SC',serif;font-size:26px;letter-spacing:0.14em;color:var(--brass)}

/* TEMPLATE: photo — framed photo + headline block */
.t-photo .art{height:850px;margin:26px 26px 0;position:relative;overflow:hidden;background:var(--paper-deep)}
.t-photo .art img{width:100%;height:100%;object-fit:cover}
.t-photo .art::after{content:"";position:absolute;inset:16px;border:1.5px solid rgba(243,235,216,0.55);pointer-events:none}
.t-photo .frame{position:absolute;inset:12px;border:1.5px solid var(--ink-faint);outline:2.5px solid var(--ink-faint);outline-offset:5px;pointer-events:none;opacity:.65}
.t-photo .block{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;text-align:center;padding:34px 70px 10px}
.t-photo .head{font-family:'IM Fell English',serif;font-size:72px;line-height:1.08;color:var(--ink);text-wrap:balance}
.t-photo .line{font-size:31px;line-height:1.45;color:var(--ink-soft);max-width:24em;text-wrap:pretty}

/* TEMPLATE: photofull — full-bleed + scrim title */
.t-photofull .art{position:absolute;inset:0;bottom:150px;overflow:hidden}
.t-photofull .art img{width:100%;height:100%;object-fit:cover}
.t-photofull .scrim{position:absolute;left:0;right:0;bottom:150px;height:620px;background:var(--scrim-bottom);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:20px;padding:0 70px 56px;text-align:center}
.t-photofull .eyebrow{color:var(--gilt)}
.t-photofull .head{font-family:'IM Fell English',serif;font-size:78px;line-height:1.08;color:var(--text-on-art);text-wrap:balance;text-shadow:0 2px 18px rgba(26,18,10,0.45)}
.t-photofull .line{font-size:30px;line-height:1.45;color:rgba(243,235,216,0.92);max-width:22em;text-wrap:pretty}
.t-photofull .foot{position:absolute;left:0;right:0;bottom:0;height:150px;padding:22px 60px;justify-content:center;gap:10px}
.t-photofull .foot .foot-rule{display:none}
.t-photofull .art::after{content:"";position:absolute;inset:16px;bottom:16px;border:1.5px solid rgba(243,235,216,0.35);pointer-events:none}

/* TEMPLATE: claim — typeset card */
.t-claim{background:var(--paper-warm)}
.t-claim .field{flex:1;margin:26px;position:relative;background:var(--paper);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:44px;text-align:center;padding:80px 76px;border:1.5px solid var(--ink-faint);outline:3px solid var(--ink-faint);outline-offset:7px}
.t-claim .fil{position:absolute;font-family:'IM Fell English',serif;color:var(--gilt);font-size:44px;line-height:1}
.t-claim .fil.tl{top:22px;left:30px}.t-claim .fil.tr{top:22px;right:30px}.t-claim .fil.bl{bottom:18px;left:30px}.t-claim .fil.br{bottom:18px;right:30px}
.t-claim .eyebrow{font-size:30px}
.t-claim .head{font-family:'IM Fell English',serif;font-size:104px;line-height:1.1;color:var(--ink);text-wrap:balance}
.t-claim .head em{font-style:italic;color:var(--oxblood)}
.t-claim .divider{width:220px;height:1px;background:var(--border-ornament);position:relative}
.t-claim .divider::after{content:"";position:absolute;left:50%;top:-3.5px;width:8px;height:8px;transform:translateX(-50%) rotate(45deg);background:var(--gilt)}
.t-claim .line{font-size:34px;line-height:1.5;color:var(--ink-soft);max-width:18em;text-wrap:pretty}
`;

function pinHTML(p) {
  const foot = `<div class="foot">
    <div class="foot-rule"></div>
    <div class="wordmark"><img src="${A('mark-ink.png')}"/><span>Little Fables</span></div>
    <div class="site">littlefables.app</div>
  </div>`;
  if (p.template === 'photo') {
    const fit = p.fit === 'contain' ? 'object-fit:contain;background:#F3EBD8;' : '';
    return `<div class="pin t-photo">
      <div class="art"${p.fit === 'contain' ? ' style="background:#F3EBD8"' : ''}><img src="${A(p.image)}" style="object-position:${p.pos || '50% 50%'};${fit}"/></div>
      <div class="block">
        <div class="eyebrow">${p.eyebrow}</div>
        <div class="head">${p.headline}</div>
        <div class="line">${p.line}</div>
      </div>${foot}</div>`;
  }
  if (p.template === 'photofull') {
    return `<div class="pin t-photofull">
      <div class="art"><img src="${A(p.image)}" style="object-position:${p.pos || '50% 50%'}"/></div>
      <div class="scrim">
        ${p.eyebrow ? `<div class="eyebrow">${p.eyebrow}</div>` : ''}
        <div class="head">${p.headline}</div>
        ${p.line ? `<div class="line">${p.line}</div>` : ''}
      </div>${foot}</div>`;
  }
  // claim
  return `<div class="pin t-claim">
    <div class="field">
      <div class="fil tl">❦</div><div class="fil tr">❦</div><div class="fil bl">❦</div><div class="fil br">❦</div>
      <div class="eyebrow">${p.eyebrow}</div>
      <div class="head">${p.headline}</div>
      <div class="divider"></div>
      <div class="line">${p.line}</div>
    </div>${foot}</div>`;
}

(async () => {
  const only = process.argv[2] ? process.argv[2].split(',') : null;
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 1 });
  for (const p of cfg.pins) {
    if (only && !only.includes(p.id)) continue;
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${pinHTML(p)}</body></html>`;
    const tmp = path.join(ROOT, 'out', '_tmp-' + p.id + '.html');
    fs.writeFileSync(tmp, html);
    await page.goto('file://' + tmp, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(ROOT, 'out', p.id + '.png') });
    console.log('rendered', p.id);
  }
  await browser.close();
})();
