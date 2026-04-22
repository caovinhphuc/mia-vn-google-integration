#!/usr/bin/env python3
"""
Wrapper: logic kiểm tra Sheets nằm trong modules/verify_sheets.py.
Chạy từ thư mục automation/: python3 verify_sheets.py
"""
import importlib.util
import os
import sys


def main() -> int:
    root = os.path.dirname(os.path.abspath(__file__))
    target = os.path.join(root, 'modules', 'verify_sheets.py')
    if not os.path.isfile(target):
        print(f"❌ Không tìm thấy: {target}")
        return 1
    spec = importlib.util.spec_from_file_location('verify_sheets_impl', target)
    if spec is None or spec.loader is None:
        print('❌ Không load được modules/verify_sheets.py')
        return 1
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    ok = bool(mod.main())
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
