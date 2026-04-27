"""
Migration script to move data from localStorage to SQLite database
Run this script after starting the backend server.
Usage: python migrate_from_localstorage.py
"""
import asyncio
import json
import os

# Try to import requests, will prompt user to install if not available
try:
    import httpx
except ImportError:
    print("Installing required package...")
    os.system("pip install httpx")
    import httpx

LOCALSTORAGE_PATHS = [
    # You need to export your localStorage data to these JSON files first
    # Instructions: Open browser console and run:
    # console.log(JSON.stringify(localStorage.getItem('cn2en_data')))
    # Save the output to the corresponding file
    "migration_data/items.json",  # cn2en_data
    "migration_data/settings.json",  # cn2en_settings
    "migration_data/wrong_notes.json",  # cn2en_wrong_notes
    "migration_data/daily_stats.json",  # cn2en_daily_stats
]

API_BASE_URL = "http://localhost:8000"


async def migrate_items(client):
    """Migrate items from localStorage to database."""
    items_path = LOCALSTORAGE_PATHS[0]
    if not os.path.exists(items_path):
        print(f"  Skipping items - file not found: {items_path}")
        return 0

    with open(items_path, "r", encoding="utf-8") as f:
        items = json.load(f)

    if not items:
        print("  No items to migrate")
        return 0

    count = 0
    for item in items:
        try:
            await client.post(
                "/api/items/",
                json={
                    "zh_text": item.get("zh_text", ""),
                    "en_standard": item.get("en_standard", ""),
                    "en_optimized": item.get("en_optimized"),
                    "learned": item.get("learned", False),
                    "learn_count": item.get("learn_count", 0),
                    "segments": item.get("segments"),
                    "difficulty": item.get("difficulty"),
                    "error_count": item.get("error_count", 0),
                },
            )
            count += 1
        except Exception as e:
            print(f"  Error migrating item {item.get('id')}: {e}")

    return count


async def migrate_settings(client):
    """Migrate settings from localStorage to database."""
    settings_path = LOCALSTORAGE_PATHS[1]
    if not os.path.exists(settings_path):
        print(f"  Skipping settings - file not found: {settings_path}")
        return 0

    with open(settings_path, "r", encoding="utf-8") as f:
        settings = json.load(f)

    if not settings:
        print("  No settings to migrate")
        return 0

    count = 0
    for key, value in settings.items():
        try:
            await client.put(f"/api/settings/{key}", json=value)
            count += 1
        except Exception as e:
            print(f"  Error migrating setting {key}: {e}")

    return count


async def migrate_wrong_notes(client):
    """Migrate wrong notes from localStorage to database."""
    wrong_notes_path = LOCALSTORAGE_PATHS[2]
    if not os.path.exists(wrong_notes_path):
        print(f"  Skipping wrong notes - file not found: {wrong_notes_path}")
        return 0

    with open(wrong_notes_path, "r", encoding="utf-8") as f:
        wrong_notes = json.load(f)

    wrong_ids = wrong_notes.get("wrong_ids", [])
    if not wrong_ids:
        print("  No wrong notes to migrate")
        return 0

    count = 0
    for item_id in wrong_ids:
        try:
            await client.post(f"/api/wrong-notes/{item_id}")
            count += 1
        except Exception as e:
            print(f"  Error migrating wrong note {item_id}: {e}")

    return count


async def migrate_daily_stats(client):
    """Migrate daily stats from localStorage to database."""
    stats_path = LOCALSTORAGE_PATHS[3]
    if not os.path.exists(stats_path):
        print(f"  Skipping daily stats - file not found: {stats_path}")
        return 0

    with open(stats_path, "r", encoding="utf-8") as f:
        stats = json.load(f)

    if not stats:
        print("  No daily stats to migrate")
        return 0

    try:
        await client.put(
            "/api/daily-stats/update",
            params={"is_correct": False},  # This endpoint only updates current day
        )
        return 1
    except Exception as e:
        print(f"  Error migrating daily stats: {e}")
        return 0


async def main():
    print("=== Cn2En localStorage → SQLite Migration ===\n")

    print("Step 1: Export your localStorage data")
    print("Open your browser console (F12) and run these commands:")
    print()
    print("  // Export items")
    print("  const items = localStorage.getItem('cn2en_data');")
    print("  console.log(items);")
    print("  // Save to migration_data/items.json")
    print()
    print("  // Export settings")
    print("  const settings = localStorage.getItem('cn2en_settings');")
    print("  console.log(settings);")
    print("  // Save to migration_data/settings.json")
    print()
    print("  // Export wrong notes")
    print("  const wrongNotes = localStorage.getItem('cn2en_wrong_notes');")
    print("  console.log(wrongNotes);")
    print("  // Save to migration_data/wrong_notes.json")
    print()
    print("  // Export daily stats")
    print("  const dailyStats = localStorage.getItem('cn2en_daily_stats');")
    print("  console.log(dailyStats);")
    print("  // Save to migration_data/daily_stats.json")
    print()

    input("Press Enter when you have exported your data (or skip with empty files)...")

    os.makedirs("migration_data", exist_ok=True)

    print("\nStep 2: Starting migration...\n")

    async with httpx.AsyncClient(base_url=API_BASE_URL) as client:
        print("Migrating items...")
        items_count = await migrate_items(client)
        print(f"  ✓ Migrated {items_count} items\n")

        print("Migrating settings...")
        settings_count = await migrate_settings(client)
        print(f"  ✓ Migrated {settings_count} settings\n")

        print("Migrating wrong notes...")
        wrong_notes_count = await migrate_wrong_notes(client)
        print(f"  ✓ Migrated {wrong_notes_count} wrong notes\n")

        print("Migrating daily stats...")
        stats_count = await migrate_daily_stats(client)
        print(f"  ✓ Migrated {stats_count} daily stats\n")

    print("=== Migration Complete ===")
    print(f"Total: {items_count + settings_count + wrong_notes_count + stats_count} records migrated")


if __name__ == "__main__":
    asyncio.run(main())
