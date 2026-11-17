"""Copy supplied photos without cropping; originals remain untouched."""
from pathlib import Path
from PIL import Image, ImageOps
import json
root = Path(__file__).resolve().parents[1]
pairs = '''IMG_7862.PNG permanent-spa-before-front
IMG_7860.PNG permanent-spa-after-front
IMG_7919.PNG permanent-spa-before-back
IMG_7916.PNG permanent-spa-after-back
IMG_8609.PNG permanent-spa-hair-ritual-1000ml
IMG_8606.PNG permanent-spa-hair-ritual-300ml
IMG_8753.PNG permanent-spa-hair-ritual-pouring-bowl
IMG_8596.PNG permanent-spa-hair-revival-300ml
IMG_8014.JPG.jpeg silk-protein-1000ml
IMG_8757.PNG silk-protein-salon-application-1
IMG_8766.PNG silk-protein-salon-application-2
IMG_8599.PNG coffee-scalp-scrub-jar
IMG_8761.PNG coffee-scalp-scrub-salon-wash
IMG_8760.PNG coffee-scalp-scrub-before-after
IMG_8602.PNG anti-hairfall-tonic-marble
IMG_8601.PNG anti-hairfall-tonic-fur
IMG_8763.PNG anti-hairfall-tonic-before-after
IMG_8597.PNG collagen-plex-masque-marble
IMG_8603.PNG collagen-plex-masque-fur
IMG_8607.PNG maintenance-shampoo-1000ml
IMG_8600.PNG maintenance-shampoo-300ml
IMG_8744.PNG scalp-detox-anti-dandruff-shampoo-1000ml'''
manifest=[]
for line in pairs.splitlines():
 old,new=line.split(); src=root.parent/'Pictures'/old; dest=root/'public/assets'/f'{new}.jpg'
 im=ImageOps.exif_transpose(Image.open(src)).convert('RGB'); im.thumbnail((1600,1600),Image.Resampling.LANCZOS); im.save(dest,quality=82,optimize=True,progressive=True)
 manifest.append(dict(original=old,file=dest.name,width=im.width,height=im.height,bytes=dest.stat().st_size))
(root/'docs/photo-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'{len(manifest)} photos; {sum(x["bytes"] for x in manifest):,} bytes total')
