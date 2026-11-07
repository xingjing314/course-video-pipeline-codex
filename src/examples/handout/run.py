"""独立示例：只读取本例的数据、素材，并直接调用公共处理。"""
import argparse
import json
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[2] / 'scripts'))
import handout


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=HERE / 'output')
    parser.add_argument('--font-chinese')
    parser.add_argument('--font-symbols')
    parser.add_argument('--overwrite', action='store_true')
    args = parser.parse_args()
    config = json.loads((HERE / 'data/handout.json').read_text(encoding='utf-8'))
    fonts = config.get('fonts', {}) | {k: v for k, v in {'chinese': args.font_chinese, 'symbols': args.font_symbols}.items() if v}
    result = handout.build_handout(
        pages=config['pages'], lesson=config['lesson'], asset_dir=HERE / 'assets',
        output_dir=args.output, pdf_name=config['pdf_name'], style=config.get('style'),
        fonts=fonts, image_options=config.get('image_options'), overwrite=args.overwrite,
    )
    print(f'公共处理：{Path(handout.__file__).resolve()}')
    print(f'已生成 {len(config["pages"])} 页：{result} ({result.stat().st_size} bytes)')


if __name__ == '__main__':
    main()
