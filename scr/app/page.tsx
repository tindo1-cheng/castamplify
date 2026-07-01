import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ background:'#0B1220', color:'#F4F6F8', fontFamily:'system-ui, Arial, sans-serif', minHeight:'100vh' }}>
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 48px', borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:17, fontWeight:500 }}>
          <span style={{ width:30, height:30, border:'1px solid #C9A84C', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', color:'#C9A84C', fontSize:13 }}>CA</span>
          CASTAMPLIFY
        </div>
        <Link href="/sign-up" style={{ fontSize:13, border:'1px solid #C9A84C', color:'#C9A84C', padding:'9px 20px', borderRadius:2 }}>Start free — 90 days</Link>
      </nav>
      <section style={{ padding:'96px 48px', textAlign:'center', borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize:12, letterSpacing:2, color:'#C9A84C', marginBottom:28 }}>THE GLOBAL CREATOR INFRASTRUCTURE COMPANY</div>
        <h1 style={{ fontSize:52, fontWeight:500, lineHeight:1.15, maxWidth:780, margin:'0 auto 24px' }}>The operating system behind the world's most influential voices</h1>
        <p style={{ fontSize:17, color:'#9AA4B2', maxWidth:600, margin:'0 auto 40px', lineHeight:1.6 }}>One contract. Eight pillars. 190+ markets. Built for news organisations, NGOs, elected officials, and independent creators — free for 90 days, no card required.</p>
        <div style={{ display:'flex', gap:16, justifyContent:'center' }}>
          <Link href="/sign-up" style={{ background:'#F4F6F8', color:'#0B1220', padding:'14px 32px', fontSize:14, borderRadius:2, fontWeight:500 }}>Start free for 90 days</Link>
          <Link href="#about" style={{ border:'1px solid rgba(255,255,255,0.25)', color:'#F4F6F8', padding:'14px 32px', fontSize:14, borderRadius:2 }}>View capabilities</Link>
        </div>
      </section>
      <section style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
        {[['190+','MARKETS'],['233','LANGUAGES'],['102','CHANNELS'],['8','PILLARS'],['98.2%','AI-OPERATED'],['90 DAYS','FREE TRIAL']].map(([n,l],i) => (
          <div key={l} style={{ padding:'32px 16px', textAlign:'center', borderRight: i<5 ? '0.5px solid rgba(255,255,255,0.08)' : 'none' }}>
            <div style={{ fontSize:26, fontWeight:500, color:'#C9A84C' }}>{n}</div>
            <div style={{ fontSize:11, color:'#9AA4B2', marginTop:6, letterSpacing:0.5 }}>{l}</div>
          </div>
        ))}
      </section>
      <footer style={{ padding:48, textAlign:'center', borderTop:'0.5px solid rgba(255,255,255,0.08)', marginTop:80 }}>
        <div style={{ fontSize:12, color:'#6B7480', letterSpacing:0.5 }}>CASTAMPLIFY LTD — REGISTERED IN ENGLAND & WALES — A GLOBAL CREATOR INFRASTRUCTURE COMPANY</div>
      </footer>
    </main>
  )
}
