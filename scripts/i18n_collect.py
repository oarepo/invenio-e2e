#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Collect translations using invenio-i18n >= 3.5.0.

Called by scripts/build-translations.js. Bypasses the Flask CLI so that
no app context or entry-point loading is required.

Writes two output files:
  - translations.json  flat { locale: { key: value } }  loaded by I18nService in tests
  - <locale>.json      per-package { package: { key: value } }  for debugging

Usage:
    python scripts/i18n_collect.py --output-dir translations -l de -l en
    python scripts/i18n_collect.py --output-dir translations -l de -p invenio-app-rdm
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from invenio_i18n.translation_utilities.collect import collect_translations
from invenio_i18n.translation_utilities.discovery import (
    find_all_packages_with_translations,
)


def main() -> None:
    """Parse arguments and run translation collection."""
    parser = argparse.ArgumentParser(
        description="Collect Invenio translations to JSON."
    )
    parser.add_argument(
        "-l",
        "--locale",
        action="append",
        dest="locales",
        default=[],
        metavar="LOCALE",
        help="Locale to collect (e.g. de). Can be repeated.",
    )
    parser.add_argument(
        "-p",
        "--packages",
        action="append",
        dest="packages",
        default=[],
        metavar="PKG",
        help="Package to collect from. Can be repeated.",
    )
    parser.add_argument(
        "--all-packages",
        action="store_true",
        help="Collect from all invenio_* packages.",
    )
    parser.add_argument(
        "--write-package-wise-too",
        action="store_true",
        help="Also write per-package JSON files.",
    )
    parser.add_argument(
        "--output-dir", required=True, help="Directory to write translations into."
    )
    args = parser.parse_args()

    if not args.locales:
        print("Error: at least one -l <locale> is required.", file=sys.stderr)
        sys.exit(1)

    if args.all_packages:
        packages = [
            name for name, _ in find_all_packages_with_translations(prefix="invenio_")
        ]
    else:
        packages = args.packages

    if not packages:
        print(
            "Error: no packages found. Pass -p <pkg> or --all-packages.",
            file=sys.stderr,
        )
        sys.exit(1)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    data = collect_translations(packages, args.locales)

    flat: dict[str, dict[str, str]] = {}
    by_locale: dict[str, dict[str, dict[str, str]]] = {}

    for pkg in data:
        for bundle in pkg.translation_bundles:
            locale = bundle.locale
            flat.setdefault(locale, {})
            by_locale.setdefault(locale, {})
            by_locale[locale][pkg.package_name] = {}
            for msg in bundle.messages:
                flat[locale][msg.msgid] = msg.text
                by_locale[locale][pkg.package_name][msg.msgid] = msg.text

    _write_json(output_dir / "translations.json", flat)

    for locale, locale_data in by_locale.items():
        _write_json(output_dir / f"{locale}.json", locale_data)

    if args.write_package_wise_too:
        for pkg in data:
            pkg_translations: dict[str, dict[str, str]] = {}
            for bundle in pkg.translation_bundles:
                pkg_translations[bundle.locale] = {
                    msg.msgid: msg.text for msg in bundle.messages
                }
            if pkg_translations:
                pkg_file = output_dir / pkg.package_name / "translations.json"
                pkg_file.parent.mkdir(parents=True, exist_ok=True)
                _write_json(pkg_file, pkg_translations)

    print(f"Collected translations for {len(packages)} package(s) into {output_dir}.")


def _write_json(path: Path, data: object) -> None:
    """Write data as indented JSON to path."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
