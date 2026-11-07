"""讲义公共入口的有界回归检查；运行环境额外需要 pypdf。"""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts'))
from handout import ImageOptions, TextRenderer, build_handout, prepare_image


class HandoutTests(unittest.TestCase):
    def test_crop_preserves_input_and_separates_preview(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / 'original.png'
            Image.new('RGBA', (200, 100), (255, 0, 0, 128)).save(source)
            before = source.read_bytes()
            result = prepare_image(source, root / 'image.jpg', root / 'preview.jpg',
                                   crop=[120, 60, 20, 10], options=ImageOptions(preview_long_edge=60))
            self.assertEqual(source.read_bytes(), before)
            self.assertEqual(result['imageSize'], [120, 60])
            with Image.open(root / 'preview.jpg') as preview:
                self.assertEqual(preview.size, (60, 30))
            with Image.open(root / 'image.jpg') as image:
                self.assertEqual(image.size, (120, 60))
                self.assertGreater(image.getpixel((0, 0))[1], 100)  # 透明部分以白底合成。
            with self.assertRaisesRegex(ValueError, '裁切范围'):
                prepare_image(source, root / 'bad.jpg', root / 'bad-preview.jpg', crop=[201, 50, 0, 0])
            self.assertFalse((root / 'bad.jpg').exists())

    def test_mixed_font_wrap_and_explicit_line_break(self):
        text = TextRenderer()
        value = '中文 PDF / A4；权限 ≠ 建议。\n独立解析'
        lines = text.wrap(value, 10, 90)
        self.assertEqual(''.join(lines), value.replace('\n', ''))
        self.assertTrue(all(text.width(line, 10) <= 90 for line in lines))
        self.assertEqual(lines[-1], '独立解析')

    def test_failed_build_and_overwrite_keep_existing_results(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            assets = root / 'assets'
            assets.mkdir()
            Image.new('RGB', (200, 100), 'white').save(assets / 'source.png')
            page = {'id': 'p1', 'title': '知识页', 'kind': '知识图解', 'image': 'source.png'}
            args = dict(lesson={'title': '测试'}, asset_dir=assets, output_dir=root / 'output')
            with self.assertRaises(FileNotFoundError):
                build_handout(pages=[page, dict(page, id='p2', image='missing.png')], **args)
            self.assertEqual(list((root / 'output').iterdir()), [])
            pdf = build_handout(pages=[page], **args)
            before = pdf.read_bytes()
            with self.assertRaises(FileExistsError):
                build_handout(pages=[dict(page, title='变更')], **args)
            self.assertEqual(pdf.read_bytes(), before)

    def test_example_runs_without_any_original_project_reads(self):
        with tempfile.TemporaryDirectory() as tmp:
            isolated = Path(tmp)
            (isolated / 'scripts').mkdir()
            shutil.copy2(ROOT / 'scripts/handout.py', isolated / 'scripts/handout.py')
            example = isolated / 'src/examples/handout'
            shutil.copytree(ROOT / 'src/examples/handout', example,
                            ignore=shutil.ignore_patterns('output', 'reference', '__pycache__'))
            # 仅保留公共模块与示例；即使代码偷用绝对路径，也禁止打开原项目文件。
            probe = '''
import pathlib, runpy, sys
original = pathlib.Path(sys.argv[1]).resolve()
entry = pathlib.Path(sys.argv[2]).resolve()
def guard(event, args):
    if event == 'open' and isinstance(args[0], (str, bytes)):
        p = pathlib.Path(args[0]).resolve()
        if p == original or original in p.parents:
            raise PermissionError('示例读取原项目：' + str(p))
sys.addaudithook(guard)
sys.argv = [str(entry)]
runpy.run_path(str(entry), run_name='__main__')
'''
            run = subprocess.run([sys.executable, '-B', '-c', probe, str(ROOT), str(example / 'run.py')],
                                 cwd=isolated, text=True, capture_output=True)
            self.assertEqual(run.returncode, 0, run.stderr)
            self.assertIn(str(isolated / 'scripts/handout.py'), run.stdout)
            config = json.loads((example / 'data/handout.json').read_text())
            output = example / 'output'
            pdf = PdfReader(output / config['pdf_name'])
            self.assertEqual(len(pdf.pages), 3)
            self.assertEqual([x.title for x in pdf.outline], [p['chapter'] for p in config['pages']])
            self.assertEqual([pdf.get_destination_page_number(x) for x in pdf.outline], [0, 1, 2])
            for i, page in enumerate(pdf.pages, 1):
                self.assertGreater(float(page.mediabox.width), float(page.mediabox.height))
                self.assertIn(f'{i:02} / 03', page.extract_text())
                self.assertNotIn('视频', ''.join(page.extract_text().split()))
            self.assertNotIn('正确答案', pdf.pages[1].extract_text())
            # 中文与 Helvetica 分段绘制，提取器可能在字体切换处插入换行。
            analysis_text = ''.join(pdf.pages[2].extract_text().split())
            self.assertIn('正确答案：C', analysis_text)
            self.assertIn('不能自行修改', analysis_text)
            records = json.loads((output / 'selection.json').read_text())['pages']
            self.assertEqual([p['time'] for p in records], ['', '', ''])
            for page in records:
                data = (example / 'assets' / page['inputImage']).read_bytes()
                self.assertEqual(page['inputSha256'], hashlib.sha256(data).hexdigest())
            print('独立运行通过：只复制公共模块和示例，禁止打开原项目文件。')


if __name__ == '__main__':
    unittest.main()
