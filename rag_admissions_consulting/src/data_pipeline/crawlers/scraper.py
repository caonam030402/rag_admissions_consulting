#!/usr/bin/env python3
"""
Web Scraper for RAG Admissions Consulting
Scrapes website content and saves to JSON format
"""

import sys
import os
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from loguru import logger
import time


def update_backend_status(data_source_id: str, status: str, error_message: str = None):
    """Update backend với trạng thái xử lý"""
    try:
        # TODO: Implement API call to update status
        logger.info(f"DataSource {data_source_id}: {status}")
        if error_message:
            logger.error(f"Error: {error_message}")
    except Exception as e:
        logger.error(f"Failed to update backend status: {e}")


class WebScraper:
    def __init__(self, base_url: str, data_source_id: str):
        self.base_url = base_url
        self.data_source_id = data_source_id
        self.visited_urls = set()
        self.results = []

    def scrape_page(self, url: str) -> dict:
        """Scrape single page"""
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "html.parser")

            # Extract title
            title = soup.find("title")
            title_text = title.get_text().strip() if title else ""

            # Extract main content
            content = []

            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer"]):
                script.decompose()

            # Extract text from paragraphs, headings, and lists
            for element in soup.find_all(
                ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li"]
            ):
                text = element.get_text().strip()
                if text and len(text) > 10:  # Filter out very short text
                    content.append(text)

            return {"url": url, "title": title_text, "content": content}

        except Exception as e:
            logger.error(f"Error scraping {url}: {e}")
            return None

    def scrape_site(self, max_pages: int = 50) -> list:
        """Scrape multiple pages from the site"""
        to_visit = [self.base_url]
        scraped_count = 0

        while to_visit and scraped_count < max_pages:
            url = to_visit.pop(0)

            if url in self.visited_urls:
                continue

            logger.info(f"Scraping page {scraped_count + 1}/{max_pages}: {url}")

            page_data = self.scrape_page(url)
            if page_data:
                self.results.append(page_data)
                self.visited_urls.add(url)
                scraped_count += 1

                # Find more links to crawl (simplified)
                try:
                    response = requests.get(url, timeout=10)
                    soup = BeautifulSoup(response.content, "html.parser")

                    for link in soup.find_all("a", href=True):
                        href = link["href"]
                        full_url = urljoin(url, href)

                        # Only crawl internal links
                        if urlparse(full_url).netloc == urlparse(self.base_url).netloc:
                            if (
                                full_url not in self.visited_urls
                                and full_url not in to_visit
                            ):
                                to_visit.append(full_url)

                except Exception as e:
                    logger.error(f"Error finding links in {url}: {e}")

            time.sleep(1)  # Be respectful to the server

        return self.results

    def save_results(self, output_path: str) -> str:
        """Save scraping results to JSON file"""
        try:
            # Ensure output directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(self.results, f, ensure_ascii=False, indent=2)

            logger.success(f"Saved {len(self.results)} pages to {output_path}")
            return output_path

        except Exception as e:
            logger.error(f"Error saving results: {e}")
            raise


def main():
    """Main scraper function"""
    if len(sys.argv) != 3:
        print("Usage: python scraper.py <url> <data_source_id>")
        sys.exit(1)

    url = sys.argv[1]
    data_source_id = sys.argv[2]

    logger.info(f"🕷️ Starting web scraping for: {url}")
    logger.info(f"📊 DataSource ID: {data_source_id}")

    try:
        # Update status to processing
        update_backend_status(data_source_id, "processing")

        # Initialize scraper
        scraper = WebScraper(url, data_source_id)

        # Scrape the website
        results = scraper.scrape_site(max_pages=100)

        if not results:
            raise Exception("No content scraped from the website")

        # Save results to JSON
        json_output_path = f"data_pipeline/raw_data/scraped_{data_source_id}.json"
        scraper.save_results(json_output_path)

        # Convert JSON to CSV for vector store
        csv_output_path = f"data_pipeline/processed_data/scraped_{data_source_id}.csv"
        convert_json_to_csv(json_output_path, csv_output_path)

        # Update backend with success
        logger.success(f"✅ Web scraping completed successfully!")
        logger.info(f"📄 Scraped {len(results)} pages")
        logger.info(f"💾 JSON saved to: {json_output_path}")
        logger.info(f"📊 CSV saved to: {csv_output_path}")

        # Output results for backend to capture
        print(f"SUCCESS: Scraped {len(results)} pages, saved to {csv_output_path}")

    except Exception as e:
        error_msg = f"Web scraping failed: {str(e)}"
        logger.error(error_msg)
        update_backend_status(data_source_id, "failed", error_msg)
        print(f"ERROR: {error_msg}")
        sys.exit(1)


def convert_json_to_csv(json_path: str, csv_path: str):
    """Convert scraped JSON to CSV format for vector store"""
    import csv
    import re

    try:
        # Ensure output directory exists
        os.makedirs(os.path.dirname(csv_path), exist_ok=True)

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        with open(csv_path, "w", encoding="utf-8", newline="") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["Text"])

            for entry in data:
                title = entry.get("title", "").strip()
                content = entry.get("content", [])

                # Clean and combine content
                filtered_content = []
                if isinstance(content, list):
                    for c in content:
                        c_text = str(c).strip()
                        if c_text and len(c_text) > 10:  # Filter short content
                            filtered_content.append(c_text)
                else:
                    c_text = str(content).strip()
                    if c_text and len(c_text) > 10:
                        filtered_content.append(c_text)

                # Combine title and content
                if filtered_content:
                    text = (
                        title + " " + " ".join(filtered_content)
                        if title
                        else " ".join(filtered_content)
                    )
                    # Clean whitespace
                    text = re.sub(r"[\n\r\t]+", " ", text)
                    text = re.sub(r"\s+", " ", text)
                    writer.writerow([text.strip()])

        logger.success(f"Converted JSON to CSV: {csv_path}")

    except Exception as e:
        logger.error(f"Error converting JSON to CSV: {e}")
        raise


if __name__ == "__main__":
    main()
