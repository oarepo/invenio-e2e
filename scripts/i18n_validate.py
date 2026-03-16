#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Validate translations using invenio-i18n >= 3.5.0.

Called by scripts/validate-translations.js. Bypasses the Flask CLI so that
no app context or entry-point loading is required.

Usage:
    python scripts/i18n_validate.py --output-dir translations
    python scripts/i18n_validate.py --output-dir translations -l de
    python scripts/i18n_validate.py --output-dir translations -p invenio-app-rdm
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Optional

from invenio_i18n.translation_utilities.discovery import (
    find_all_packages_with_translations,
)
from invenio_i18n.translation_utilities.validate import (
    validate_translations,
    write_validation_report,
)


def main() -> None:
    """Parse arguments and run translation validation."""
    parser = argparse.ArgumentParser(description="Validate Invenio translations.")
    parser.add_argument(
        "-l",
        "--locale",
        action="append",
        dest="locales",
        default=[],
        metavar="LOCALE",
        help="Locale to validate (e.g. de). Can be repeated. Defaults to all.",
    )
    parser.add_argument(
        "-p",
        "--packages",
        action="append",
        dest="packages",
        default=[],
        metavar="PKG",
        help="Package to validate. Can be repeated.",
    )
    parser.add_argument(
        "--all-packages", action="store_true", help="Validate all invenio_* packages."
    )
    parser.add_argument(
        "-o",
        "--output-dir",
        required=True,
        help="Directory to write validation-report.json into.",
    )
    args = parser.parse_args()

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

    locales: Optional[list[str]] = args.locales if args.locales else None
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    summary = validate_translations(packages, locales)
    write_validation_report(summary, output_dir)
    print(f"Validation report written: {output_dir / 'validation-report.json'}")


if __name__ == "__main__":
    main()
