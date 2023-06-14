from playwright.sync_api import sync_playwright
import os

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp("http://localhost:9222")
    default_context = browser.contexts[0]
    page = default_context.new_page()

    page.goto('https://seller-id.tiktok.com/compass/promotion-analytics')

    page.pause()

    print('login')
    page.close()
    
    