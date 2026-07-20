import { useNavigate } from 'react-router-dom';
import { CalendarCheck, CheckCircle, Clock, Building2, CreditCard, Bell, Shield, ArrowRight, ChevronRight, Users, Calendar } from 'lucide-react';

const FEATURES = [
  { icon:Calendar,    title:'Prise de RDV en ligne',      desc:'Créneaux disponibles, réservation en quelques clics 24h/24.',            color:'#10b981', bg:'#ecfdf5' },
  { icon:CheckCircle, title:'Validation instantanée',     desc:'L\'admin confirme ou refuse. Le client est notifié aussitôt.',           color:'#3b82f6', bg:'#eff6ff' },
  { icon:Bell,        title:'Notifications automatiques', desc:'Emails à chaque étape : confirmation, refus, paiement.',                 color:'#f59e0b', bg:'#fffbeb' },
  { icon:CreditCard,  title:'Paiement sécurisé',          desc:'Mobile Money, carte bancaire, virement ou espèces.',                    color:'#8b5cf6', bg:'#faf5ff' },
  { icon:Building2,   title:'Multi-entreprises',           desc:'Plusieurs entreprises et domaines sur une seule plateforme.',           color:'#f97316', bg:'#fff7ed' },
  { icon:Shield,      title:'Sécurité maximale',           desc:'JWT, rate limiting, validation stricte et logs de sécurité.',          color:'#ef4444', bg:'#fef2f2' },
];

export default function LandingPage() {
  const nav = useNavigate();
  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:'Inter,sans-serif', color:'#0f172a' }}>

      {/* Navbar */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, background:'rgba(255,255,255,.95)', backdropFilter:'blur(16px)', borderBottom:'1px solid #f1f5f9', height:64, display:'flex', alignItems:'center' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, background:'linear-gradient(135deg,#10b981,#059669)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <CalendarCheck size={18} color="#fff" />
            </div>
            <span style={{ fontSize:18, fontWeight:800 }}>RendezVous <span style={{ color:'#10b981' }}>Pro</span></span>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => nav('/login')} style={{ fontSize:14, fontWeight:500, color:'#475569', background:'none', border:'none', cursor:'pointer', padding:'8px 16px', borderRadius:8, fontFamily:'Inter,sans-serif' }}>
              Se connecter
            </button>
            <button onClick={() => nav('/inscription')} style={{ fontSize:14, fontWeight:600, color:'#fff', background:'linear-gradient(135deg,#10b981,#059669)', border:'none', cursor:'pointer', padding:'9px 20px', borderRadius:10, fontFamily:'Inter,sans-serif', boxShadow:'0 2px 8px rgba(16,185,129,.3)' }}>
              Commencer gratuitement
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop:100, paddingBottom:80, padding:'100px 24px 80px', background:'linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 50%,#f0f4ff 100%)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'5%', right:'-5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,.2) 0%,transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#ecfdf5', border:'1px solid #a7f3d0', borderRadius:50, padding:'6px 18px', marginBottom:28, fontSize:13, fontWeight:600, color:'#065f46' }}>
             Plateforme professionnelle de gestion de rendez-vous
          </div>
          <h1 style={{ fontSize:58, fontWeight:800, lineHeight:1.1, marginBottom:20 }}>
            Gérez vos rendez-vous
            <span style={{ display:'block', color:'#10b981' }}>comme un professionnel</span>
          </h1>
          <p style={{ fontSize:18, color:'#475569', lineHeight:1.7, marginBottom:36, maxWidth:560, margin:'0 auto 36px' }}>
            RendezVous Pro connecte <strong>clients</strong>, <strong>personnel</strong> et <strong>administrateurs</strong> pour une gestion fluide, sécurisée et automatisée.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:56 }}>
            <button onClick={() => nav('/inscription')} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', fontWeight:700, fontSize:15, padding:'14px 32px', borderRadius:14, border:'none', cursor:'pointer', boxShadow:'0 4px 20px rgba(16,185,129,.35)', fontFamily:'Inter,sans-serif' }}>
              Démarrer maintenant <ArrowRight size={18}/>
            </button>
            <button onClick={() => nav('/login')} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#fff', color:'#334155', fontWeight:600, fontSize:15, padding:'14px 32px', borderRadius:14, border:'2px solid #e2e8f0', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
              Se connecter <ChevronRight size={18}/>
            </button>
          </div>
          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, maxWidth:700, margin:'0 auto' }}>
            {[{v:'100%',l:'Sécurisé',s:'JWT + chiffrement'},{v:'3',l:'Rôles',s:'Client, Personnel, Admin'},{v:'24/7',l:'Disponible',s:'Réservation en ligne'},{v:'∞',l:'RDV',s:'Gestion illimitée'}].map(s=>(
              <div key={s.l} style={{ background:'rgba(255,255,255,.9)', border:'1px solid rgba(255,255,255,.9)', borderRadius:14, padding:16, textAlign:'center', backdropFilter:'blur(8px)' }}>
                <p style={{ fontSize:28, fontWeight:800, color:'#10b981' }}>{s.v}</p>
                <p style={{ fontSize:13, fontWeight:600, color:'#0f172a', marginTop:2 }}>{s.l}</p>
                <p style={{ fontSize:11, color:'#64748b' }}>{s.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:'80px 24px', background:'#fff' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'#10b981', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8 }}>Fonctionnalités</p>
            <h2 style={{ fontSize:34, fontWeight:800, marginBottom:12 }}>Tout ce dont vous avez besoin</h2>
            <p style={{ fontSize:15, color:'#64748b' }}>Une plateforme complète couvrant tout le cycle de vie d'un rendez-vous.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ padding:24, borderRadius:16, border:'2px solid #f1f5f9', background:'#fff', transition:'all .3s', cursor:'default' }}
                onMouseOver={e => { e.currentTarget.style.borderColor='#a7f3d0'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,.07)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor='#f1f5f9'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ width:44, height:44, borderRadius:12, background:f.bg, color:f.color, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                  <f.icon size={20}/>
                </div>
                <h3 style={{ fontSize:14, fontWeight:700, marginBottom:6 }}>{f.title}</h3>
                <p style={{ fontSize:13, color:'#64748b', lineHeight:1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'80px 24px', background:'#f8fafc' }}>
        <div style={{ maxWidth:700, margin:'0 auto', textAlign:'center' }}>
          <div style={{ background:'linear-gradient(135deg,#10b981,#059669)', borderRadius:28, padding:'52px 40px', boxShadow:'0 24px 60px rgba(16,185,129,.25)' }}>
            <h2 style={{ fontSize:34, fontWeight:800, color:'#fff', marginBottom:10 }}>Prêt à démarrer ?</h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,.85)', marginBottom:28 }}>Créez votre compte et prenez votre premier rendez-vous en 2 minutes.</p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => nav('/inscription')} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#fff', color:'#059669', fontWeight:700, fontSize:15, padding:'13px 28px', borderRadius:12, border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                Créer un compte gratuit <ArrowRight size={17}/>
              </button>
              <button onClick={() => nav('/login')} style={{ display:'inline-flex', alignItems:'center', gap:8, border:'2px solid rgba(255,255,255,.4)', color:'#fff', fontWeight:600, fontSize:15, padding:'13px 28px', borderRadius:12, background:'none', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                Se connecter <ChevronRight size={17}/>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'#0f172a', padding:'40px 24px 28px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, background:'linear-gradient(135deg,#10b981,#059669)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <CalendarCheck size={16} color="#fff"/>
              </div>
              <span style={{ fontSize:16, fontWeight:800, color:'#fff' }}>RendezVous <span style={{ color:'#10b981' }}>Pro</span></span>
            </div>
            <div style={{ display:'flex', gap:24 }}>
              {['Fonctionnalités','Contact','Confidentialité','CGU'].map(l=>(
                <a key={l} href="#" style={{ fontSize:13, color:'#64748b' }}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop:'1px solid #1e293b', paddingTop:20, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <p style={{ fontSize:13, color:'#475569' }}>© {new Date().getFullYear()} RendezVous Pro. Tous les droits réservés.</p>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:7, height:7, background:'#10b981', borderRadius:'50%', display:'inline-block', animation:'pulse 2s ease-in-out infinite' }}/>
              <span style={{ fontSize:12, color:'#475569' }}>Système opérationnel</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
