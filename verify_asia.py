from playwright.sync_api import sync_playwright

def verify(page):
    print("Navigating to index.html...")
    page.goto('http://localhost:8000')
    page.wait_for_timeout(3000)

    print("Hovering over Japan (Asia)...")
    # Roughly hover over Japan
    page.mouse.move(600, 300)
    page.wait_for_timeout(500)
    page.screenshot(path='/home/jules/verification/hover_japan.png')

    print("Hovering over India (Asia)...")
    # Roughly hover over India
    page.mouse.move(450, 450)
    page.wait_for_timeout(500)
    page.screenshot(path='/home/jules/verification/hover_india.png')

if __name__ == '__main__':
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 800, 'height': 600})
        verify(page)
        browser.close()
