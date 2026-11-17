# AMREAL client change report — 10 October 2026

Source: the latest root-level `(1).docx`, not the older `public/info/` document. Read `document.xml` in order, mapped relationship IDs to all 42 embedded images, visually reviewed each image, and read all six reviewer comments. Paragraph numbers below refer to zero-based XML paragraph order.

## Image mapping

All destinations are under `public/assets/`. All 22 originals remain untouched. JPEG quality 82, maximum dimension 1600px, EXIF orientation applied, no cropping. Combined size: 4,216,375 bytes (~4.2 MB). Old asset files were retained; rejected label imagery is removed from the website references.

| Original | New filename | Used in |
| --- | --- | --- |
| `IMG_7862.PNG` | `permanent-spa-before-front.jpg` | Hair Spa gallery: front Before; homepage comparison |
| `IMG_7860.PNG` | `permanent-spa-after-front.jpg` | Hair Spa gallery: front After; homepage comparison |
| `IMG_7919.PNG` | `permanent-spa-before-back.jpg` | Hair Spa gallery: back Before; homepage comparison; social |
| `IMG_7916.PNG` | `permanent-spa-after-back.jpg` | Hair Spa gallery: back After; homepage comparison; social |
| `IMG_8609.PNG` | `permanent-spa-hair-ritual-1000ml.jpg` | Hair Spa main pack, card, gallery, category, hero slide, social |
| `IMG_8606.PNG` | `permanent-spa-hair-ritual-300ml.jpg` | Hair Spa 300 ml gallery and product gallery |
| `IMG_8753.PNG` | `permanent-spa-hair-ritual-pouring-bowl.jpg` | Hair Spa In use gallery; social |
| `IMG_8596.PNG` | `permanent-spa-hair-revival-300ml.jpg` | Copied only — awaiting packaging confirmation |
| `IMG_8014.JPG.jpeg` | `silk-protein-1000ml.jpg` | Silk Protein main/card, galleries and hero slide |
| `IMG_8757.PNG` | `silk-protein-salon-application-1.jpg` | Silk Protein gallery: salon application |
| `IMG_8766.PNG` | `silk-protein-salon-application-2.jpg` | Silk Protein gallery: second application |
| `IMG_8599.PNG` | `coffee-scalp-scrub-jar.jpg` | Scalp Scrub main/card, gallery, Scalp Care category, social |
| `IMG_8761.PNG` | `coffee-scalp-scrub-salon-wash.jpg` | Scalp Scrub gallery: in use |
| `IMG_8760.PNG` | `coffee-scalp-scrub-before-after.jpg` | Scalp Scrub gallery: complete before/after panel |
| `IMG_8602.PNG` | `anti-hairfall-tonic-marble.jpg` | Anti-Hairfall Tonic main/card and gallery |
| `IMG_8601.PNG` | `anti-hairfall-tonic-fur.jpg` | Anti-Hairfall Tonic gallery |
| `IMG_8763.PNG` | `anti-hairfall-tonic-before-after.jpg` | Anti-Hairfall Tonic gallery: complete 3/6-month panel |
| `IMG_8597.PNG` | `collagen-plex-masque-marble.jpg` | Masque main/card, gallery and hero slide |
| `IMG_8603.PNG` | `collagen-plex-masque-fur.jpg` | Masque gallery and alternate format route |
| `IMG_8607.PNG` | `maintenance-shampoo-1000ml.jpg` | Maintenance Shampoo main/card, gallery, Home Care category |
| `IMG_8600.PNG` | `maintenance-shampoo-300ml.jpg` | Maintenance Shampoo 300 ml gallery |
| `IMG_8744.PNG` | `scalp-detox-anti-dandruff-shampoo-1000ml.jpg` | Anti Dandruff Shampoo main/card, gallery and hero slide |

## Document checklist

“Done” means implemented and statically checked. Desktop (1440px) and mobile (375px) browser checks completed after permissions were enabled; see the verification section.

| Document item / locator | Status | Result / reason |
| --- | --- | --- |
| P0–3: Justhuman-style same-product gallery | Done | Large image, five thumbnail choices spanning four image types; shared home/detail component. |
| P0–3: Before / After / 2 Months After timeline | Partly done | Front and back pairs work through explicit toggles; two-month slot is named and shows a pending state because no photo was supplied. |
| P7–13: highlighted hero statement | Done | “MORE THAN A HAIR SPA / 3–5 MONTHS OF SMOOTHER, MORE MANAGEABLE HAIR / ONE RITUAL. LONG-LASTING RESULTS.” |
| P15–25: 2–3 ingredient cards in front of product | Done | Collagen Proteins, Hydrolyzed Keratin, Argan Oil overlay in Ingredients view. B5 remains in the ingredient content. |
| P27–31: all hair types and personalization | Done | Included below hero ingredient content. |
| P35–81: Silk Protein hair types, short concerns, ingredient technology | Done | Short hair-type list and concern chips; full ingredient information retained, later ingredient revisions applied. |
| P83–133: tonic concerns, benefits, suitable-for, active technology | Done | All supplied concerns/benefits/suitability retained; exact seven-actives list displayed. |
| P136–169: masque sizes, concerns, benefits and suitability | Done | 500 ml / 250 ml; all listed concerns and benefits; suitable-for content retained. |
| P178: gold mark above AMREAL name | Done | Existing `amreal-logo-golden-above.png` used for brand and WhatsApp avatar. |
| P179, P209/image21: light pink / matte white | Done | Pink and white surfaces, white ingredient cards, pink diagram surfaces; beige gallery frame removed. |
| P182–184/images8,7: smaller single-line ticker | Done | Each supplied line is a single unwrapped moving row; 12px type with spacing. |
| P186–192/image26: six hero slides and visible product colour | Partly done | Six slides, no washout overlay, full-frame photos, mobile opacity fixed. Nanoplastia has an explicit photo placeholder pending its asset. |
| P187, P224/image38: first catalog page with four girls | Partly done | Existing cover matches the four-girls reference visually. No PDF is available to verify page one; existing image contains an orange annotation. Request clean source. |
| P188, P226–228/image9: Hair Spa slide copy and attractive emphasis | Done | Requested up-to-four-month copy, clearer typography, contrasting pink/white surfaces. |
| P193/image20: floating WhatsApp | Done | Number 9266437855; correct `https://wa.me/919266437855` link, compact corner control and responsive popup. |
| P197–202/image13: longevity and effortless blow-dry | Done | Two readable metric cards; exact longevity/supporting copy; small hair-dryer SVG icon. |
| P204: more hero images and guidance | Done | Both pack sizes, two result pairs, pouring photo and ingredients view. README explains adding pairs/follow-up assets. |
| P213–221/images37,42,11,7: move upper ticker down, new two-line copy, gaps, speed | Done | Removed ticker from header; placed immediately below hero at the indicated former marquee location. Exact supplied lines; 32-second cycle with pause on hover and reduced-motion support. |
| P231–234/image15: Silk intro | Done | Exact requested intro on product and hero slide. |
| P237/image36/comment0: replace Nanoplastia slide highlights | Done | No foul smell / Smoke-free application / Up to 100% straight. |
| P237/image36/comment1: NANOPLASTIA only | Done | Cards, titles and hero slide use NANOPLASTIA; existing route slugs preserved. |
| P240/image39/comment2: Anti Dandruff Shampoo only | Done | Product and hero title corrected. |
| P242–259/images14,35: clear Hair Ritual pack, 300 ml and pouring photo | Done | Supplied updated photos in shared gallery and catalog data. |
| P262–263/image24: full-width hair-fibre content | Done | New responsive Hair Fibre Repair section covers damaged/during/after stages, moisture/protein loss, replenishment, sealing, shine, elasticity and manageability. |
| P266/image4/comment3: improve hero writing appearance | Done | Clear sans-serif hierarchy, light pink statement block and high-contrast copy. |
| P266/image4/comment4: fix cramped 3–4 month columns | Done | Two wide cards; stacked mobile layout, readable units and descriptions. |
| P269–272/image12: cleaner fonts and clear background | Done | Sans-serif headings and body, plain matte surfaces, removed flower backdrop under hero copy. |
| P278: clear product photos, 2–3 images, pouring | Done | Updated pack/galleries with all applicable supplied shots. |
| P280–282/image33: remove boxed image margins | Done | Removed image padding, inset frame/shadow and card padding; `contain` preserves full frame. |
| P284/image1/comment5: Collagen Matrix Seal clarity | Done | Larger label on a plain backing inside the SVG, no decorative circles crossing lettering. |
| P286/image1: move diagram to end | Done | Cuticle diagram now at the end of the Hair Spa detail page, after related products; removed from Silk and other product pages. |
| P287–288/image34: freeze gallery to fill blank left column | Done | Desktop gallery sticky at 105px; static on smaller screens. |
| P290–292/image2: Our Treatment / Hero Product heading | Done | Category and hero badge on separate lines; clear “OUR HERO PRODUCT · PERMANENT HAIR SPA” spotlight heading. |
| P294–302/image32: Let's Talk email and WhatsApp | Done | Clickable care@amreal.co.in and WhatsApp +91 92664 37855. |
| P305–311/image27: Best Sellers / Designed for Indian Hair | Done | Navigation, collection/catalog headings updated. |
| P314–339/image19: exactly three categories and memberships | Done | Hair Care, Scalp Care, Home Care; tonic/serum and Anti Dandruff Shampoo included in both relevant category filters. Correct names used. |
| P325–326: Pure Proteins | Partly done | Hair Care entry with clearly labeled placeholder; real image and product specifications pending. |
| P334: Maintenance Shampoo | Done | New Home Care product, 1000 ml main and 300 ml gallery image. |
| P343–350/image3: Hair Spa highlights and no pH | Done | Exact requested seven highlights. pH point removed from cards/spec bar and related headline blocks. |
| P352–354/image30: Silk highlights | Done | Exact requested highlights on primary product card. |
| P357–366/image31: Nanoplastia image/results/highlights and label removal | Partly done | Name and highlights corrected; unrelated imagery removed. Updated pack and genuine results not supplied. |
| P366: remove label/MRP pictures | Done | No label asset references remain in product galleries; originals retained on disk. |
| P371–373/image28: remove cuticle diagram from Silk | Done | Diagram only appears at end of Hair Spa details. |
| P377–387/image18: exact Silk / Collagen ingredient copy | Done | Replaced both ingredient-card descriptions and matching product ingredient strings. |
| All supplied new photo placement | Done | 21 photos placed; teal bottle copied but withheld as explicitly requested. |
| Keep entire wide Scalp Scrub and Tonic panels | Done | Full-width uncropped `contain` gallery views; no unrelated interactive comparison substitution. |
| No fabricated two-month or other-product results | Done | Removed old lifestyle-as-follow-up and Hair Spa results attributed to other products. |
| `npm run build` without TypeScript errors | Done | Passed. Vite reports a non-fatal >500 kB bundle warning. |
| Desktop and 375px live browser checks, all routes | Done | 38 route/viewport checks passed in local Chrome: 19 routes at each width, including all 12 product routes. |
| No broken images | Done | Static references and loaded browser images passed on all 38 route/viewport combinations. |
| No horizontal scroll / ticker readable / WhatsApp not covering content | Done | No viewport overflow in all 38 checks; gallery/ticker/WhatsApp screenshots reviewed. Mobile WhatsApp has an opaque bottom area with page clearance. |

## Missing assets and client confirmations

- Updated Nanoplastia pack image (1000 ml and 300 ml if separate) and genuine before/after pair.
- Genuine two-month follow-up: `permanent-spa-2-months-after.jpg`. Do not substitute a lifestyle photo.
- Pure Proteins pack image and approved product details/sizes.
- Confirmation whether teal Hair Revival 300 ml is current packaging. It remains unreferenced.
- Optional custom hair-dryer artwork. A small inline SVG icon is already supplied; no custom asset is needed for the current implementation.
- Original catalog PDF / clean first-page four-girls image. Existing cover matches the screenshot but has an orange annotation; PDF page identity cannot be independently verified.
- A separate 300 ml Silk pack photo if the client wants size-specific imagery. Current family gallery shows the supplied 1000 ml photo and application shots.

## Verification and deployment limits

- `npm run build`: PASS, no TypeScript errors.
- `node scripts/verify-assets.mjs`: PASS; 22 JPEGs, 12 product routes, six hero slides, three categories, all static referenced assets exist. Missing two-month file is deliberately not requested by the UI.
- Earlier sandbox restrictions blocked Vite/Chrome. After permissions were enabled, Vite ran successfully at `http://127.0.0.1:5173/` and headless Chrome testing completed.
- Browser checks: 38 combinations = 19 routes at 1440px and 375px. Zero broken images, horizontal viewport overflow, or page JavaScript errors. Raw results are in `docs/browser-results.json`.
- Exercised Hair Spa pack sizes, Ingredients/In use views, front/back controls, Before/After/two-month timeline, all six hero slides and WhatsApp popup/link. Reviewed desktop/mobile screenshots of the homepage, product galleries, placeholder states and contact flow.
- Admin coverage is the login page; no authenticated admin mutation or external form submission was performed.
- No deployment or remote Supabase changes were made. Existing configured Supabase rows override fallback product data; migrate those records before production release. Browser fallback uses new version-4 keys and leaves old keys intact.
- Contact/feedback submission backends remain the existing demo implementation; this request did not include a backend integration.


## Follow-up: placeholder approval and Desktop ZIP

The user authorized placeholder images for the remaining missing photography. Added coordinated, explicitly labeled SVG placeholders for Nanoplastia pack, Nanoplastia before/after, Pure Proteins, the Hair Spa two-month follow-up and Silk Protein 300 ml. The real two-month filename remains reserved; a placeholder is never presented as treatment evidence. Original missing assets remain listed above for eventual replacement.

Delivery: `AMREAL-Website.zip` on the Desktop, containing the project source, assets, documentation, package lockfile and current `dist/` production build. `START-HERE.md` explains installation, preview and deployment. Dependencies, caches, private configuration, and the obsolete change-request DOCX are excluded from the ZIP.
