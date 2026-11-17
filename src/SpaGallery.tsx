import { useState } from 'react';
import { IngredientBadge } from './ingredientIcons';

// Keep every treatment stage tied to the same front-view model.
export const spaPairs = [
  { label: 'Front view', before: '/assets/permanent-spa-before-front.jpg', after: '/assets/permanent-spa-after-front.jpg' },
];
// Page 1 of justhuman.pdf supplies After, Before and 2 months after, in that order.
export const spaTwoMonths = { src: '/assets/permanent-spa-2-months-after.jpg', available: true, placeholder: '/assets/permanent-spa-2-months-after-pending.svg' };
const spaImages = [
  { label: '1000 ml', src: '/assets/permanent-spa-hair-ritual-1000ml.jpg' },
  { label: '300 ml', src: '/assets/permanent-spa-hair-ritual-300ml.jpg' },
  { label: 'Before / After', src: spaPairs[0].after },
  { label: 'In use', src: '/assets/permanent-spa-hair-ritual-pouring-bowl.jpg' },
  { label: 'Ingredients', src: '/assets/permanent-spa-hair-ritual-1000ml.jpg' },
];
export function SpaGallery() {
  const [active, setActive] = useState(0);
  const [pair, setPair] = useState(0);
  const [timeline, setTimeline] = useState<'before' | 'after' | '2months'>('after');
  const comparison = active === 2;
  const missing = comparison && timeline === '2months' && !spaTwoMonths.available;
  const src = comparison ? timeline === '2months' ? spaTwoMonths.src : spaPairs[pair][timeline] : spaImages[active].src;
  return <div className="spa-gallery">
    <div className={`spa-gallery-stage ${active === 4 ? 'spa-ingredient-stage' : ''}`}>
      {missing ? <img src={spaTwoMonths.placeholder} alt="Placeholder: two-month follow-up photograph coming soon" /> : <img src={src} alt={comparison ? `Permanent Hair Spa — ${spaPairs[pair].label}, ${timeline === '2months' ? '2 months after' : timeline}` : `Permanent Hair Spa — ${spaImages[active].label}`} />}
      {active === 4 && <div className="spa-ingredient-overlay">{['Collagen Proteins','Hydrolyzed Keratin','Argan Oil'].map(x => <IngredientBadge key={x} text={x} variant="compact" />)}</div>}
    </div>
    <p className="spa-gallery-caption">{comparison ? `${spaPairs[pair].label} · ${timeline === '2months' ? '2 Months After' : timeline === 'before' ? 'Before treatment' : 'After treatment'}` : spaImages[active].label === 'In use' ? 'Hair Ritual · poured into the AMREAL bowl' : `Hair Ritual · ${spaImages[active].label}`}</p>
    <div className="spa-thumbnail-strip" aria-label="Product views">{spaImages.map((item,i) => <button key={item.label} type="button" aria-pressed={active === i} onClick={() => setActive(i)}><img src={item.src} alt=""/><span>{item.label}</span></button>)}</div>
    <div className="spa-timeline" aria-label="Transformation timeline">{(['before','after','2months'] as const).map(t => <button type="button" key={t} aria-pressed={comparison && timeline === t} onClick={() => {setTimeline(t);if(t === '2months') setPair(0);setActive(2);}}>{t === 'before' ? 'Before' : t === 'after' ? 'After' : '2 Months After'}</button>)}</div>
  </div>;
}

export function HairFibreStory() {
  return <section className="section fibre-story">
    <span className="eyebrow">N°3 · HAIR RITUAL</span><h2>Hair fibre repair</h2>
    <p>From damaged to transformed. Proteins, amino acids and nourishing lipids condition the hair fibre for smoother, shinier, more manageable hair.</p>
    <img className="fibre-story-reference" src="/assets/hair-fibre-repair-pdf.jpg" alt="AMREAL No.3 Hair Ritual: hair fibre repair, showing damaged hair, treatment and repaired hair" loading="lazy" />
    <div className="fibre-story-grid">
      <article><span>01 · BEFORE</span><h3>Damaged hair</h3><p>Raised cuticles, loss of protein and moisture, porous and weak fibres, frizz and dullness.</p></article>
      <article><span>02 · DURING TREATMENT</span><h3>Condition & replenish</h3><p>Active ingredients penetrate the hair fibre. Proteins, amino acids and nourishing lipids help fill gaps, restore structure and smooth the cuticle.</p></article>
      <article><span>03 · AFTER</span><h3>Smoother hair</h3><p>Sealed cuticles, stronger-looking hair, improved shine, flexibility, elasticity and manageability.</p></article>
    </div>
  </section>;
}
