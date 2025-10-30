
import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Construct the absolute file path
        file_path = "file://" + os.path.abspath("index.html")

        await page.goto(file_path)

        # Wait for the loading screen to disappear
        await page.wait_for_selector("#loading-screen", state="hidden", timeout=20000)

        # Wait for the game container to be visible
        await page.wait_for_selector("#game-container", state="visible", timeout=20000)

        # Click the orb to gain energy
        for _ in range(20):
            await page.click("#game-canvas")
            await page.wait_for_timeout(50)

        # Buy some buildings to show them in orbit
        await page.click("#building-gen1")
        await page.click("#building-gen1")
        await page.click("#building-gen2")

        # Wait a bit for the animations to settle
        await page.wait_for_timeout(1000)

        await page.screenshot(path="jules-scratch/verification/verification.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
