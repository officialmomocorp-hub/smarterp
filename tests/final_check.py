import os
import time
import requests
from playwright.sync_api import sync_playwright

def test_webapp():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Navigate to login
        print("Navigating to http://localhost:5173...")
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')
        
        # Take a screenshot for debugging
        page.screenshot(path='login_page.png')
        
        # Login
        print("Logging in as ERP Seller...")
        page.fill('input[type="email"]', 'admin@smarterp.in')
        page.fill('input[type="password"]', 'admin123')
        page.click('button[type="submit"]')
        
        # Wait for dashboard
        page.wait_for_load_state('networkidle')
        page.wait_for_url('**/dashboard**')
        print(f"Logged in successfully. Current URL: {page.url}")
        
        # Go to Manage Schools
        print("Navigating to Manage Schools...")
        page.click('text=Manage Schools')
        page.wait_for_load_state('networkidle')
        
        # Verify branding
        print("Verifying ERP Seller branding...")
        assert "ERP Seller Dashboard" in page.content(), "Missing ERP Seller Dashboard branding"
        
        # Verify school list and actions
        print("Checking for schools and management actions...")
        schools = page.locator('.card').all()
        print(f"Found {len(schools)} schools.")
        
        if len(schools) > 0:
            first_school_card = schools[0]
            school_name = first_school_card.locator('h3').text_content()
            print(f"Verifying controls for school: {school_name}")
            
            # Check for Deactivate/Activate button
            toggle_btn = first_school_card.locator('text=/Deactivate|Activate/')
            assert toggle_btn.is_visible(), "Toggle Status button not found"
            
            # Check for Delete button
            delete_btn = first_school_card.locator('button[title="Delete School"]')
            assert delete_btn.is_visible(), "Delete button not found"
            
            # Test Toggle Status
            initial_status_el = first_school_card.locator('.badge')
            initial_status = initial_status_el.text_content().strip()
            print(f"Initial Status: {initial_status}")
            
            toggle_btn.click()
            # Wait for the badge text to change
            page.wait_for_function(
                "el => el.textContent.trim() !== '" + initial_status + "'",
                initial_status_el.element_handle()
            )
            
            new_status = initial_status_el.text_content().strip()
            print(f"New Status: {new_status}")
            assert initial_status != new_status, "Status did not toggle"
            
            # Clean up: toggle back
            toggle_btn.click()
            page.wait_for_function(
                "el => el.textContent.trim() === '" + initial_status + "'",
                initial_status_el.element_handle()
            )
            print("Status toggled back.")
        else:
            print("No schools found to test management controls.")

        browser.close()

if __name__ == "__main__":
    try:
        test_webapp()
        print("\n✅ Web App Verification Success!")
    except Exception as e:
        print(f"\n❌ Web App Verification Failed: {str(e)}")
        exit(1)
