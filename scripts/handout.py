"""公共讲义处理：Pillow 配图 + ReportLab 横向 A4；课程内容由调用方提供。

从 ch08-L02～L05 的讲义脚本提取。不会加载课时、视频、组装记录或渲染器。
入口：build_handout(...)；命令行用法见 src/examples/handout/README.md。
"""
from __future__ import annotations

import argparse
from dataclasses import asdict, dataclass
from hashlib import sha256
from itertools import groupby
import json
from pathlib import Path
import tempfile

from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


@dataclass(frozen=True)
class Style:
    margin: float = 28
    title_size: float = 20
    text_size: float = 10
    leading: float = 13
    note_lines: int = 2
    accent: str = '#147984'
    ink: str = '#162C3A'
    muted: str = '#536772'
    rule: str = '#DCE3E8'
    footer: str = '#6F7E88'


@dataclass(frozen=True)
class ImageOptions:
    quality: int = 95
    subsampling: int = 0
    max_long_edge: int | None = None  # 默认保留配图像素，不用预览图排版。
    preview_long_edge: int = 1100
    preview_quality: int = 85


DEFAULT_FONTS = {
    'chinese': '/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf',
    'symbols': '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
}


class TextRenderer:
    """沿用中文 / Helvetica / 符号字体回退和逐字测宽换行。"""

    def __init__(self, fonts=None):
        paths = DEFAULT_FONTS | (fonts or {})
        self.names = {}
        for role, path in paths.items():
            path = Path(path).expanduser().resolve()
            if not path.is_file():
                raise FileNotFoundError(f'缺少 {role} 字体：{path}；用 fonts 或 --font-{role} 指定 TTF')
            name = 'Handout-' + role + '-' + sha256(path.read_bytes()).hexdigest()[:12]
            if name not in pdfmetrics.getRegisteredFontNames():
                pdfmetrics.registerFont(TTFont(name, str(path)))
            self.names[role] = name

    def font_for(self, char):
        if ord(char) < 128:
            return 'Helvetica'
        for role in ('chinese', 'symbols'):
            name = self.names[role]
            if ord(char) in pdfmetrics.getFont(name).face.charToGlyph:
                return name
        raise ValueError(f'字体缺少字符 {char!r} (U+{ord(char):04X})；请指定支持此字符的字体')

    def width(self, text, size):
        return sum(pdfmetrics.stringWidth(ch, self.font_for(ch), size) for ch in text)

    def draw(self, pdf, x, y, text, size, right=False):
        if right:
            x -= self.width(text, size)
        for font, chars in groupby(text, key=self.font_for):
            run = ''.join(chars)
            pdf.setFont(font, size)
            pdf.drawString(x, y, run)
            x += pdfmetrics.stringWidth(run, font, size)

    def wrap(self, text, size, max_width):
        lines = []
        for paragraph in text.split('\n') if text else []:
            line, used = '', 0
            for char in paragraph:
                width = self.width(char, size)
                if width > max_width:
                    raise ValueError('文字区太窄，无法容纳一个字符')
                if line and used + width > max_width:
                    lines.append(line)
                    line, used = '', 0
                line += char
                used += width
            lines.append(line)
        return lines


def prepare_image(source, target, preview, *, crop=None, options=None):
    """crop 为 [宽, 高, 左, 上] 像素；None 保留全图。始终保留输入原图。"""
    options = options or ImageOptions()
    with Image.open(source) as original:
        width, height = original.size
        w, h, x, y = crop if crop is not None else (width, height, 0, 0)
        if not (w > 0 and h > 0 and x >= 0 and y >= 0 and x + w <= width and y + h <= height):
            raise ValueError(f'裁切范围超出原图 {source} ({width}x{height})：{crop}')
        image = original.crop((x, y, x + w, y + h))
        # 带透明通道的输入转成白底，避免 JPEG 出现黑底。
        rgba = image.convert('RGBA')
        image = Image.new('RGB', rgba.size, 'white')
        image.paste(rgba, mask=rgba.getchannel('A'))
        if options.max_long_edge:
            image.thumbnail((options.max_long_edge, options.max_long_edge), Image.Resampling.LANCZOS)
        image.save(target, quality=options.quality, subsampling=options.subsampling)
        size = list(image.size)
        image.thumbnail((options.preview_long_edge, options.preview_long_edge), Image.Resampling.LANCZOS)
        image.save(preview, quality=options.preview_quality)
    return {'crop': [w, h, x, y], 'inputSize': [width, height], 'imageSize': size}


def page_time(page, lesson):
    if page.get('time'):
        return page['time']
    if 'frame' in page and 'fps' in lesson:
        seconds = int(page['frame'] / lesson['fps'])
        return f'{seconds // 60:02}:{seconds % 60:02}'
    return ''


def render_pdf(path, *, pages, lesson, image_dir, style, text):
    width, height = landscape(A4)
    margin = style.margin
    usable = width - 2 * margin
    pdf = canvas.Canvas(str(path), pagesize=(width, height), invariant=1, pageCompression=1)
    pdf.setTitle(lesson['title'])
    pdf.setAuthor(lesson.get('author', '课程讲义'))
    for number, item in enumerate(pages, 1):
        if item.get('chapter'):
            pdf.bookmarkPage(item['id'])
            pdf.addOutlineEntry(item['chapter'], item['id'], level=0)
        header = lesson.get('header', lesson['title'])
        meta = item['kind'] + (f"  |  视频 {item['time']}" if item['time'] else '')
        if text.width(header, 10) + text.width(meta, 9) + 25 > usable:
            raise ValueError('页眉文字过长，请缩短 lesson.header 或页面 kind')
        pdf.setFillColor(HexColor(style.accent))
        pdf.rect(margin, height - 38, 4, 17, fill=1, stroke=0)
        text.draw(pdf, margin + 13, height - 33, header, 10)
        pdf.setFillColor(HexColor(style.muted))
        text.draw(pdf, width - margin, height - 33, meta, 9, right=True)
        pdf.setFillColor(HexColor(style.ink))
        titles = text.wrap(item['title'], style.title_size, usable)
        title_step = style.title_size * 1.2
        for line, value in enumerate(titles):
            text.draw(pdf, margin, height - 67 - line * title_step, value, style.title_size)
        image_top = height - 84 - (len(titles) - 1) * title_step
        explanation = text.wrap(item.get('explanation', ''), style.text_size, usable)
        note = text.wrap(item.get('note', '学习笔记'), style.text_size, usable)
        note_offset = 35 + (len(explanation) - 1) * style.leading if explanation else 21
        note_depth = max(0, len(note) - 1) * style.leading
        rule_depth = 17 + 18 * (style.note_lines - 1) if style.note_lines else 0
        max_image_height = image_top - (28 + note_offset + note_depth + rule_depth)
        if max_image_height < 120:
            raise ValueError(f"{item['id']}：文字过多，请拆页，或减少笔记行数")
        iw, ih = item['imageSize']
        scale = min(usable / iw, max_image_height / ih)
        image_width, image_height = iw * scale, ih * scale
        image_y = image_top - image_height
        pdf.drawImage(ImageReader(str(image_dir / f"{item['id']}.jpg")), (width - image_width) / 2,
                      image_y, width=image_width, height=image_height)
        pdf.setFillColor(HexColor(style.muted))
        for line, value in enumerate(explanation):
            text.draw(pdf, margin, image_y - 19 - line * style.leading, value, style.text_size)
        note_y = image_y - note_offset
        for line, value in enumerate(note):
            text.draw(pdf, margin, note_y - line * style.leading, value, style.text_size)
        pdf.setStrokeColor(HexColor(style.rule))
        pdf.setLineWidth(.5)
        for line in range(style.note_lines):
            y = note_y - note_depth - 17 - 18 * line
            pdf.line(margin, y, width - margin, y)
        pdf.setFillColor(HexColor(style.footer))
        footer = lesson.get('footer', f"配套讲义  /  {lesson.get('version', 'V1.0')}")
        page_number = f'{number:02} / {len(pages):02}'
        if text.width(footer, 8) + text.width(page_number, 8) + 20 > usable:
            raise ValueError('页脚文字过长，请缩短 lesson.footer')
        text.draw(pdf, margin, 18, footer, 8)
        text.draw(pdf, width - margin, 18, page_number, 8, right=True)
        pdf.showPage()
    pdf.save()


def build_handout(*, pages, lesson, asset_dir, output_dir, pdf_name='handout.pdf',
                  style=None, fonts=None, image_options=None, overwrite=False):
    """图片与单一页面数据 -> PDF、selection.json、高质量 JPEG 和轻量预览。

    输出文件已存在时默认拒绝覆盖；overwrite 只用于调用方明确指定的重建目录。
    所有页面成功排版后才发布结果，缺图或排版失败不会留下半份交付。
    """
    asset_dir, output_dir = Path(asset_dir).resolve(), Path(output_dir).resolve()
    if asset_dir == output_dir or asset_dir in output_dir.parents or output_dir in asset_dir.parents:
        raise ValueError('输入素材目录与输出目录须分开，不能互相包含')
    if Path(pdf_name).name != pdf_name or not pdf_name.endswith('.pdf'):
        raise ValueError('pdf_name 须为单个 .pdf 文件名')
    pages = list(pages)
    ids = [p['id'] for p in pages]
    if not pages or len(set(ids)) != len(ids) or any(not i or Path(i).name != i or i in ('.', '..') for i in ids):
        raise ValueError('页面 id 须非空、唯一且不含目录')
    style, options = Style(**(style or {})), ImageOptions(**(image_options or {}))
    text = TextRenderer(fonts)
    targets = [pdf_name, 'selection.json'] + [f'{folder}/{i}.jpg' for folder in ('images-jpeg', 'previews') for i in ids]
    if not overwrite:
        for target in targets:
            if (output_dir / target).exists():
                raise FileExistsError(f'拒绝覆盖已有产物：{output_dir / target}；请换输出目录或显式使用 overwrite')
    output_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.handout-', dir=output_dir) as tmp:
        stage = Path(tmp)
        for folder in ('images-jpeg', 'previews'):
            (stage / folder).mkdir()
        records = []
        for page in pages:
            source = (asset_dir / page['image']).resolve()
            if not source.is_relative_to(asset_dir):
                raise ValueError(f"输入图片必须位于 asset_dir 内：{page['image']}")
            info = prepare_image(source, stage / 'images-jpeg' / f"{page['id']}.jpg",
                                 stage / 'previews' / f"{page['id']}.jpg", crop=page.get('crop'), options=options)
            records.append(dict(page, **info, inputImage=page['image'],
                                inputSha256=sha256(source.read_bytes()).hexdigest(),
                                image=f"images-jpeg/{page['id']}.jpg", time=page_time(page, lesson)))
        render_pdf(stage / pdf_name, pages=records, lesson=lesson, image_dir=stage / 'images-jpeg', style=style, text=text)
        selection = {'lesson': lesson, 'style': asdict(style), 'imageOptions': asdict(options), 'pages': records}
        (stage / 'selection.json').write_text(json.dumps(selection, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        for target in targets:
            destination = output_dir / target
            destination.parent.mkdir(parents=True, exist_ok=True)
            (stage / target).replace(destination)
    return output_dir / pdf_name


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data', type=Path, required=True)
    parser.add_argument('--assets', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--pdf-name')
    parser.add_argument('--font-chinese')
    parser.add_argument('--font-symbols')
    parser.add_argument('--overwrite', action='store_true')
    args = parser.parse_args()
    config = json.loads(args.data.read_text(encoding='utf-8'))
    fonts = config.get('fonts', {}) | {k: v for k, v in {'chinese': args.font_chinese, 'symbols': args.font_symbols}.items() if v}
    path = build_handout(pages=config['pages'], lesson=config['lesson'], asset_dir=args.assets,
                         output_dir=args.output, pdf_name=args.pdf_name or config.get('pdf_name', 'handout.pdf'),
                         style=config.get('style'), fonts=fonts, image_options=config.get('image_options'), overwrite=args.overwrite)
    print(f'[PDF] {len(config["pages"])} 页；{path.stat().st_size} bytes；{path}')


if __name__ == '__main__':
    main()
