"""第测试章 L01 讲义：只读本课 handout 输入，调用公共 scripts/handout.py。"""
import argparse
import json
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
HANDOUT = ROOT / "docs/lessons/test01/L01/handout"
sys.path.insert(0, str(ROOT / "scripts"))
import handout


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "deliverables/test01-L01/handout")
    parser.add_argument("--font-chinese")
    parser.add_argument("--font-symbols")
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    config = json.loads((HANDOUT / "handout.json").read_text(encoding="utf-8"))
    fonts = config.get("fonts", {}) | {k: v for k, v in {"chinese": args.font_chinese, "symbols": args.font_symbols}.items() if v}
    result = handout.build_handout(
        pages=config["pages"],
        lesson=config["lesson"],
        asset_dir=HANDOUT / "assets",
        output_dir=args.output,
        pdf_name=config["pdf_name"],
        style=config.get("style"),
        fonts=fonts,
        image_options=config.get("image_options"),
        overwrite=args.overwrite,
    )
    print(f"公共处理：{Path(handout.__file__).resolve()}")
    print(f"已生成 {len(config['pages'])} 页：{result} ({result.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
