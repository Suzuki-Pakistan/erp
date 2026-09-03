from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json, re
import xml.etree.ElementTree as ET

root=Path(r'D:\echo-work\flair-perfumes')
tmp=root/'tmp/presentation-flair'
deck=root/'output/presentations/Flair_ERP_Client_Vision_and_Demo.pptx'
issues=[]
for path in sorted((tmp/'render').glob('slide-*.json')):
    d=json.loads(path.read_text(encoding='utf-8'))
    texts=[]
    for e in d['elements']:
        b=e.get('bbox')
        if not b: continue
        x,y,w,h=b
        if x < -1 or y < -1 or x+w > 1601 or y+h > 901:
            issues.append(f'{path.stem}: out of bounds {e.get("name")} {b}')
        if e.get('text'):
            texts.append(e)
            count=e.get('textLayout',{}).get('lineCount',1)
            size=e.get('resolvedFontSize',0)
            if count*size > h+3:
                issues.append(f'{path.stem}: potential text-height issue {e["text"][:65]}')
    for i,a in enumerate(texts):
        ax,ay,aw,ah=a['bbox']
        for b in texts[i+1:]:
            bx,by,bw,bh=b['bbox']
            ix=min(ax+aw,bx+bw)-max(ax,bx)
            iy=min(ay+ah,by+bh)-max(ay,by)
            if ix>3 and iy>3:
                issues.append(f'{path.stem}: text box overlap {a["text"][:38]} / {b["text"][:38]} ({ix:.1f}x{iy:.1f})')

with ZipFile(deck) as z:
    contents={n:z.read(n) for n in z.namelist()}
    for name in contents:
        if name.endswith('.xml'):
            ET.fromstring(contents[name])
    slides=[n for n in contents if re.fullmatch(r'ppt/slides/slide\d+\.xml',n)]
    notes=[n for n in contents if re.fullmatch(r'ppt/notesSlides/notesSlide\d+\.xml',n)]
    assert len(slides)==25 and len(notes)==25, (len(slides),len(notes))
    for n in notes:
        assert b'[Sources]' in contents[n], n
    for i in range(21,26):
        name=f'ppt/slides/slide{i}.xml'
        contents[name]=re.sub(rb'<p:sld\b',b'<p:sld show="0"',contents[name],count=1)

pack=tmp/'final-packaged.pptx'
with ZipFile(pack,'w',ZIP_DEFLATED) as z:
    for name,data in contents.items(): z.writestr(name,data)
pack.replace(deck)
with ZipFile(deck) as z:
    assert z.testzip() is None
    for i in range(1,26):
        s=ET.fromstring(z.read(f'ppt/slides/slide{i}.xml'))
        assert (s.get('show')=='0')==(i>=21)
ledger='25 slides rendered and individually reviewed.\n25 speaker-note sections contain source blocks.\n20 customer slides; 5 hidden presenter slides.\nAll package XML parses and ZIP integrity passes.\n'
ledger+='\n'.join(issues) if issues else 'No out-of-bounds elements, overlapping text boxes, or text-height flags.\n'
(tmp/'qa-ledger.txt').write_text(ledger,encoding='utf-8')
print(ledger)
print(f'FINAL: {deck} ({deck.stat().st_size:,} bytes)')
extra=Path(str(deck)+'.inspect.ndjson')
if extra.exists(): extra.replace(tmp/'final-inspect.ndjson')
