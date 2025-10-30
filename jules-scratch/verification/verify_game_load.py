from playwright.sync_api import Page, expect
import os

def test_game_loads_successfully(page: Page):
    """
    This test verifies that the game loads without any errors
    and the main game UI is visible.
    """
    # 1. Arrange: Go to the index.html page.
    # Use os.path.abspath to get the full path to the file.
    page.goto(f"file://{os.path.abspath('index.html')}")

    # 2. Act: Wait for the game container to be visible.
    # This indicates that the game has loaded successfully.
    game_container = page.locator("#game-container")
    expect(game_container).to_be_visible(timeout=10000)

    # 3. Assert: Check for the presence of a key UI element.
    # We'll check if the energy value is displayed.
    energy_value = page.locator("#energy-value")
    expect(energy_value).to_be_visible()

    # 4. Screenshot: Capture the final result for visual verification.
    print("Attempting to take screenshot...")
    page.screenshot(path="jules-scratch/verification/verification.png")
    print("Screenshot taken.")

def main():
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        test_game_loads_successfully(page)
        browser.close()

if __name__ == "__main__":
    main()
