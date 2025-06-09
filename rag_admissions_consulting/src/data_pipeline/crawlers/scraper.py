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
import chardet


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

        # Setup session with proper headers
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
            }
        )

    def _detect_encoding(self, content: bytes) -> str:
        """Detect content encoding"""
        try:
            # Try to detect charset
            detected = chardet.detect(content)
            if detected and detected.get("confidence", 0) > 0.8:
                return detected["encoding"]
        except Exception as e:
            logger.warning(f"Encoding detection failed: {e}")

        # Fallback to common encodings
        for encoding in ["utf-8", "utf-8-sig", "latin1", "cp1252"]:
            try:
                content.decode(encoding)
                return encoding
            except UnicodeDecodeError:
                continue

        return "utf-8"  # Final fallback

    def scrape_page(self, url: str) -> dict:
        """Scrape single page with proper encoding handling"""
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()

            # Handle encoding properly
            if response.encoding is None or response.encoding.lower() in [
                "iso-8859-1",
                "latin1",
            ]:
                # Detect encoding from content
                detected_encoding = self._detect_encoding(response.content)
                response.encoding = detected_encoding
                logger.info(f"Detected encoding for {url}: {detected_encoding}")
            else:
                logger.info(f"Using response encoding for {url}: {response.encoding}")

            # Parse with BeautifulSoup
            soup = BeautifulSoup(
                response.content, "html.parser", from_encoding=response.encoding
            )

            # Extract title
            title = soup.find("title")
            title_text = title.get_text().strip() if title else ""

            # Extract main content
            content = []

            # Remove unwanted elements
            for unwanted in soup(
                ["script", "style", "nav", "footer", "header", "aside", "noscript"]
            ):
                unwanted.decompose()

            # Extract text from content elements
            content_selectors = [
                "main",
                "article",
                ".content",
                "#content",
                ".main-content",
                ".post-content",
                ".entry-content",
                ".page-content",
            ]

            main_content = None
            for selector in content_selectors:
                main_content = soup.select_one(selector)
                if main_content:
                    break

            # If no main content found, use body
            if not main_content:
                main_content = soup.find("body")

            if main_content:
                # Extract text from paragraphs, headings, and lists
                for element in main_content.find_all(
                    [
                        "p",
                        "h1",
                        "h2",
                        "h3",
                        "h4",
                        "h5",
                        "h6",
                        "li",
                        "div",
                        "span",
                        "td",
                        "th",
                    ]
                ):
                    text = element.get_text(separator=" ", strip=True)
                    if text and len(text) > 15:  # Filter out very short text
                        # Clean up text
                        text = " ".join(text.split())  # Normalize whitespace
                        content.append(text)

            # Remove duplicates while preserving order
            seen = set()
            unique_content = []
            for item in content:
                if item not in seen:
                    seen.add(item)
                    unique_content.append(item)

            result = {
                "url": url,
                "title": title_text,
                "content": unique_content,
                "encoding": response.encoding,
            }

            logger.info(
                f"Successfully scraped {url} - {len(unique_content)} content blocks"
            )
            return result

        except requests.RequestException as e:
            logger.error(f"Request error scraping {url}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error scraping {url}: {e}")
            return None

    def scrape_site(self, max_pages: int = 1) -> list:
        """Scrape multiple pages from the site"""
        to_visit = [self.base_url]
        scraped_count = 0

        while to_visit and scraped_count < max_pages:
            url = to_visit.pop(0)

            if url in self.visited_urls:
                continue

            logger.info(f"Scraping page {scraped_count + 1}/{max_pages}: {url}")

            page_data = self.scrape_page(url)
            if page_data and page_data.get("content"):
                self.results.append(page_data)
                self.visited_urls.add(url)
                scraped_count += 1

                # Find more links to crawl (simplified)
                if scraped_count < max_pages:
                    try:
                        response = self.session.get(url, timeout=10)
                        soup = BeautifulSoup(
                            response.content,
                            "html.parser",
                            from_encoding=response.encoding,
                        )

                        for link in soup.find_all("a", href=True):
                            href = link.get("href", "").strip()
                            if not href:
                                continue

                            full_url = urljoin(url, href)

                            # Only crawl internal links
                            if (
                                urlparse(full_url).netloc
                                == urlparse(self.base_url).netloc
                                and full_url not in self.visited_urls
                                and full_url not in to_visit
                                and not any(
                                    ext in full_url.lower()
                                    for ext in [
                                        ".pdf",
                                        ".doc",
                                        ".zip",
                                        ".jpg",
                                        ".png",
                                        ".gif",
                                    ]
                                )
                            ):
                                to_visit.append(full_url)

                    except Exception as e:
                        logger.error(f"Error finding links in {url}: {e}")

            time.sleep(1)  # Be respectful to the server

        return self.results

    def save_results(self, output_path: str) -> str:
        """Save scraping results to JSON file with proper UTF-8 encoding"""
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
        results = scraper.scrape_site(max_pages=1)

        if not results:
            raise Exception("No content scraped from the website")

        # Get the correct base directory (project root)
        script_dir = os.path.dirname(os.path.abspath(__file__))  # crawlers/
        data_pipeline_dir = os.path.dirname(script_dir)  # data_pipeline/
        base_dir = os.path.dirname(os.path.dirname(data_pipeline_dir))  # project root

        # Save results to JSON - using correct project structure
        json_output_path = os.path.join(
            data_pipeline_dir, "raw_data", f"scraped_{data_source_id}.json"
        )
        scraper.save_results(json_output_path)

        # Convert JSON to CSV for vector store - using correct project structure
        csv_output_path = os.path.join(
            data_pipeline_dir, "processed_data", f"scraped_{data_source_id}.csv"
        )
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
    """Convert scraped JSON to CSV format for vector store with proper UTF-8 handling"""
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
                        if c_text and len(c_text) > 20:  # Filter short content
                            # Additional text cleaning
                            c_text = re.sub(r"[\n\r\t]+", " ", c_text)
                            c_text = re.sub(r"\s+", " ", c_text)
                            filtered_content.append(c_text)
                else:
                    c_text = str(content).strip()
                    if c_text and len(c_text) > 20:
                        c_text = re.sub(r"[\n\r\t]+", " ", c_text)
                        c_text = re.sub(r"\s+", " ", c_text)
                        filtered_content.append(c_text)

                # Combine title and content
                if filtered_content:
                    if title:
                        text = f"{title}. {' '.join(filtered_content)}"
                    else:
                        text = " ".join(filtered_content)

                    # Final text cleaning
                    text = text.strip()
                    if len(text) > 50:  # Only include substantial content
                        writer.writerow([text])

        logger.success(f"Converted JSON to CSV: {csv_path}")

    except Exception as e:
        logger.error(f"Error converting JSON to CSV: {e}")
        raise


if __name__ == "__main__":
    main()
