import os
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Listen for console messages and print them to the output
    page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

    # Use abspath to create a file URI
    file_path = os.path.abspath('index.html')
    page.goto(f'file://{file_path}')

    # Wait for the loading screen to disappear and the game to be ready.
    # A good indicator is the visibility of the game container.
    game_container = page.locator('#game-container')
    expect(game_container).to_be_visible(timeout=15000) # Wait up to 15s

    # The store is rendered dynamically, so wait for it too.
    store_container = page.locator('#store-container')
    expect(store_container).to_be_visible()

    # We need energy to buy things. Let's click the orb (canvas) to get some.
    # Building 1 costs 15, upgrade 1 costs 150.
    canvas = page.locator('#game-canvas')

    # Click 15 times to get enough energy for the first building
    for _ in range(15):
        canvas.click()
        page.wait_for_timeout(50) # small delay between clicks

    # Buy the first building
    page.locator('#building-gen1').click()

    # Now get enough energy for the first upgrade
    # We need 150. We might have some from passive generation, but clicking is more reliable.
    for _ in range(150):
        canvas.click()
        page.wait_for_timeout(50) # small delay between clicks

    # Buy the first upgrade
    page.locator('#upgrade-upg1').click()

    # Give a moment for UI to update
    page.wait_for_timeout(500)

    # Now take the screenshot
    page.screenshot(path='jules-scratch/verification/verification.png')

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
