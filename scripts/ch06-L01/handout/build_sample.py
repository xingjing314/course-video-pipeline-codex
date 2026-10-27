from pathlib import Path
import json, re
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
root=Path(__file__).resolve().parents[3]
base=root/'deliverables/ch06-L01/handout-sample-v0.1'
base.mkdir(parents=True,exist_ok=True)
items=json.loads((root/'docs/lessons/ch06/L01/handout/sample-v0.1/selection.json').read_text())
pdfmetrics.registerFont(TTFont('Chinese','/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf'))
W,H=landscape(A4)
pdf=canvas.Canvas(str(base/'第六章-L01-配套讲义样稿V0.1.pdf'),pagesize=(W,H))
pdf.setTitle('第六章 项目管理概论 | L01 配套讲义样稿 V0.1')
pdf.setAuthor('课程讲义')
def draw(x,y,text,right=False):
 size=pdf._fontsize
 runs=re.findall(r'[\x00-\x7f]+|[^\x00-\x7f]+',text)
 runs=[('Helvetica' if ord(r[0])<128 else 'Chinese',r) for r in runs]
 width=sum(pdfmetrics.stringWidth(r,font,size) for font,r in runs)
 if right:x-=width
 for font,r in runs:
  pdf.setFont(font,size);pdf.drawString(x,y,r)
  x+=pdfmetrics.stringWidth(r,font,size)
 pdf.setFont('Chinese',size)
for i,item in enumerate(items,1):
 pdf.setFillColor(HexColor('#147984'));pdf.rect(28,H-38,4,17,fill=1,stroke=0)
 pdf.setFont('Chinese',10);draw(41,H-33,'第六章 项目管理概论  /  L01 配套讲义')
 pdf.setFillColor(HexColor('#536772'));pdf.setFont('Chinese',9)
 draw(W-28,H-33,f"{item['kind']}  |  视频 {item['time']}",right=True)
 pdf.setFillColor(HexColor('#162C3A'));pdf.setFont('Chinese',20)
 draw(28,H-67,item['title'])
 iw=W-56; ih=iw*860/1760; iy=H-84-ih
 pdf.drawImage(str(base/'images'/f"{item['id']}.png"),28,iy,width=iw,height=ih)
 pdf.setFillColor(HexColor('#536772'));pdf.setFont('Chinese',10)
 draw(28,iy-21,item['note'])
 pdf.setStrokeColor(HexColor('#DCE3E8'));pdf.setLineWidth(.5)
 for y in [iy-38,iy-56]:pdf.line(28,y,W-28,y)
 pdf.setFont('Chinese',8);pdf.setFillColor(HexColor('#6F7E88'))
 draw(28,18,'配套讲义  /  样稿 V0.1')
 draw(W-28,18,f'{i:02} / {len(items):02}',right=True)
 pdf.showPage()
pdf.save()
print(base/'第六章-L01-配套讲义样稿V0.1.pdf')
