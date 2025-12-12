#!/usr/bin/env python3
"""
Utility that converts the raw db.json export into the runtime-friendly
public/zagrava_db_v1.json file and (optionally) extracts img.zip assets.
"""

from __future__ import annotations

import json
import random
import re
import shutil
import sys
import zipfile
from pathlib import Path
from typing import Iterable, List

ROOT = Path(__file__).resolve().parents[1]
RAW_DB = ROOT / 'db.json'
OUT_DB = ROOT / 'public' / 'zagrava_db_v1.json'
IMG_ZIP = ROOT / 'img.zip'
IMG_ROOT = ROOT / 'public' / 'img'

LEVEL_COLORS: List[str] = ['white', 'yellow', 'pink', 'red']
TIME_RANGES = {
    'yellow': (2, 4),
    'pink': (4, 6),
    'red': (6, 10),
}

CATEGORY_KEYWORDS = {
    'action': ['доторк', 'поцілу', 'масаж', 'танцю', 'зніма', 'пест', 'огол'],
    'question': ['розповід', 'опис', 'згадай', 'поділися', 'істор', 'фантаз'],
    'game': ['гра', 'ігров', 'жереб', 'жарт', 'вгадай', 'конкурс'],
}

MOOD_KEYWORDS = {
    'romantic': ['ніжн', 'романтич', 'тепл', 'душев', 'подих'],
    'playful': ['гра', 'жарт', 'флірт', 'пустощ'],
    'passionate': ['пристраст', 'гаряч', 'гаряче', 'ерот', 'спокуш'],
    'deep': ['відверто', 'зізнан', 'довіра', 'меж', 'філософ'],
}

CONSENT_TERMS = ['роздяг', 'оголен', 'секс', 'інтим', 'пози', 'іграшк', 'ванн', 'масаж', 'тіло']


def ensure_image_dirs() -> None:
    for color in LEVEL_COLORS:
        (IMG_ROOT / color).mkdir(parents=True, exist_ok=True)


def extract_images() -> None:
    ensure_image_dirs()
    if not IMG_ZIP.exists():
        print(f'[process_db] img.zip not found at {IMG_ZIP}, skipping extraction.', file=sys.stderr)
        return

    target = IMG_ROOT / 'red'
    with zipfile.ZipFile(IMG_ZIP) as archive:
        for member in archive.infolist():
            if member.is_dir():
                continue
            filename = Path(member.filename).name
            if not filename:
                continue
            destination = target / filename
            with archive.open(member) as src, destination.open('wb') as dst:
                shutil.copyfileobj(src, dst)
    print(f'[process_db] Extracted images to {target}')


def sanitize_text(text: str) -> str:
    return re.sub(r'\s+', ' ', text).strip()


def make_title(text: str, limit: int = 8) -> str:
    words = text.split()
    if len(words) <= limit:
        return text
    return ' '.join(words[:limit]) + '…'


def detect_category(text: str) -> str:
    lower = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(key in lower for key in keywords):
            return category
    return 'question'


def detect_mood(text: str) -> str:
    lower = text.lower()
    for mood, keywords in MOOD_KEYWORDS.items():
        if any(key in lower for key in keywords):
            return mood
    return random.choice(list(MOOD_KEYWORDS.keys()))


def needs_consent(text: str) -> bool:
    lower = text.lower()
    return any(term in lower for term in CONSENT_TERMS)


def parse_images(raw_value, color: str) -> List[str]:
    if not raw_value:
        return []

    def normalize(entry: str) -> str:
        entry = entry.strip().strip('{}')
        if not entry:
            return ''
        filename = Path(entry).name
        if not filename:
            return ''
        return f'/img/{color}/{filename}'

    values: Iterable[str]
    if isinstance(raw_value, (list, tuple)):
        values = raw_value
    else:
        cleaned = str(raw_value).replace('{', '').replace('}', '')
        values = cleaned.split(',')

    images = [normalize(candidate) for candidate in values]
    images = [img for img in images if img]
    # Preserve order but drop duplicates
    seen = set()
    unique = []
    for img in images:
        if img in seen:
            continue
        seen.add(img)
        unique.append(img)
    return unique


def time_limit_for(color: str) -> int | None:
    if color not in TIME_RANGES:
        return None
    low, high = TIME_RANGES[color]
    return random.randint(low, high)


def build_cards() -> list[dict]:
    if not RAW_DB.exists():
        raise FileNotFoundError(f'Cannot find {RAW_DB}')

    data = json.loads(RAW_DB.read_text(encoding='utf-8'))
    random.seed(42)

    items: list[dict] = []
    all_tasks = data.get('allTasks', {})

    for color in LEVEL_COLORS:
        task_list = all_tasks.get(color, [])
        for entry in task_list:
            if not entry or entry.get('active') in (0, '0'):
                continue
            raw_text = sanitize_text(entry.get('task', ''))
            if not raw_text:
                continue
            legacy_id = entry.get('id')
            card_id = f'{color}-{legacy_id}' if legacy_id is not None else f'{color}-{len(items) + 1}'
            card = {
                'id': card_id,
                'legacy_id': legacy_id,
                'level': color,
                'title_ua': make_title(raw_text),
                'description_ua': raw_text,
                'category': detect_category(raw_text),
                'mood': detect_mood(raw_text),
                'consent_required': needs_consent(raw_text),
                'images': parse_images(entry.get('img'), color),
                'time_limit_minutes': time_limit_for(color),
                'tags': [],
            }
            items.append(card)

    items.sort(key=lambda item: (LEVEL_COLORS.index(item['level']), item.get('legacy_id') or 0))
    return items


def main() -> None:
    extract_images()
    cards = build_cards()
    payload = {'version': 2, 'items': cards}
    OUT_DB.parent.mkdir(parents=True, exist_ok=True)
    OUT_DB.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'[process_db] Wrote {len(cards)} cards to {OUT_DB}')


if __name__ == '__main__':
    main()
