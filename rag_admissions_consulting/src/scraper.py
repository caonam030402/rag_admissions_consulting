import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scraper import WebScraper

url = "https://donga.edu.vn/tuyensinh"


def main():
    # Initialize the scraper with the base URL
    scraper = WebScraper(url)

    # Scrape admission-related pages
    print("Starting to scrape...")
    results = scraper.scrape_site("/", max_pages=500)

    # Save the results
    scraper.save_results(results, "donga_admissions.json")
    print("Scraping completed. Results saved to donga_admissions.json")


if __name__ == "__main__":
    main()
