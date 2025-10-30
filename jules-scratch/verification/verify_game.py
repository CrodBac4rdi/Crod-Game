from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto("http://localhost:8000/", timeout=60000)

            # Warten, bis das Spiel vollständig geladen ist und die UI bereit ist
            page.wait_for_selector("#loading-screen", state="hidden", timeout=30000)
            page.wait_for_selector("#energy-display", state="visible", timeout=10000)

            # Genug Energie für die ersten Käufe sammeln
            for _ in range(20):
                page.locator("#energy-orb").click(timeout=5000)
                page.wait_for_timeout(100) # Kurze Pause, um Reaktivität zu simulieren

            # Store öffnen
            page.locator("button:has-text('Store')").click()

            # Erstes Gebäude kaufen, um Upgrades freizuschalten
            page.locator("#store-item-building-0 .btn").click()

            # Upgrades kaufen, um neue Gebäude freizuschalten
            page.locator("#store-item-upgrade-0 .btn").click()
            page.locator("#store-item-upgrade-1 .btn").click()

            # Genug Energie für die teureren Gebäude sammeln
            for _ in range(50):
                page.locator("#energy-orb").click(timeout=5000)
                page.wait_for_timeout(100)

            # Die neuen Gebäude kaufen, um die Orbits zu zeigen
            page.locator("#store-item-building-1 .btn").click()
            page.locator("#store-item-building-2 .btn").click()

            # Store schliessen, um die Szene zu sehen
            page.locator("button:has-text('Store')").click()

            # Eine längere Pause, damit die Animationen laufen und die Orbits sichtbar werden
            page.wait_for_timeout(5000)

            page.screenshot(path="jules-scratch/verification/verification.png")
            print("Screenshot wurde erfolgreich in jules-scratch/verification/verification.png gespeichert.")

        except Exception as e:
            print(f"Ein Fehler ist aufgetreten: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
            print("Ein Fehler-Screenshot wurde in jules-scratch/verification/error.png gespeichert.")

        finally:
            browser.close()

if __name__ == "__main__":
    run()
