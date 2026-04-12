import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1280, "height": 800})
        print("Navigating to http://localhost:3000")
        await page.goto('http://localhost:3000')
        print("Waiting for image to load...")
        try:
            await page.wait_for_selector('img[alt="LangGraph Architecture Diagram"]', timeout=3000)
            await asyncio.sleep(2)
        except Exception as e:
            print("Image load wait exception:", e)
        print("Saving screenshot...")
        await page.screenshot(path='frontend/public/screenshot.png')
        await browser.close()
        print("Done.")

asyncio.run(run())
