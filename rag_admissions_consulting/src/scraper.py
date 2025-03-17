import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from typing import List, Dict, Optional
import time
import logging
from pathlib import Path
import json
from urllib.robotparser import RobotFileParser

class WebScraper:
    def __init__(self, base_url: str, output_dir: str = 'data'):
        self.base_url = base_url
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'RAG Admissions Bot/1.0'
        })
        self.robot_parser = RobotFileParser()
        self.robot_parser.set_url(urljoin(base_url, '/robots.txt'))
        try:
            self.robot_parser.read()
        except Exception as e:
            logging.warning(f"Could not read robots.txt: {e}")

        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    def can_fetch(self, url: str) -> bool:
        """Check if we're allowed to fetch the URL according to robots.txt"""
        try:
            return self.robot_parser.can_fetch('*', url)
        except Exception:
            return True

    def _make_request(self, url: str, delay: float = 1.0) -> Optional[requests.Response]:
        """Make a request with rate limiting and error handling"""
        if not self.can_fetch(url):
            self.logger.warning(f"URL {url} is not allowed by robots.txt")
            return None

        time.sleep(delay)  # Rate limiting
        try:
            response = self.session.get(url)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error fetching {url}: {e}")
            return None

    def scrape_page(self, url: str) -> Dict:
        """Scrape a single page and extract relevant information"""
        response = self._make_request(url)
        if not response:
            return {}

        soup = BeautifulSoup(response.text, 'html.parser')
        data = {
            'url': url,
            'title': soup.title.string if soup.title else '',
            'content': [],
            'metadata': {}
        }

        # Extract main content (customize selectors based on target website)
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content')
        if main_content:
            # Extract paragraphs
            for p in main_content.find_all('p'):
                if p.text.strip():
                    data['content'].append(p.text.strip())

            # Extract headers
            for h in main_content.find_all(['h1', 'h2', 'h3', 'h4']):
                if h.text.strip():
                    data['content'].append(f"Header: {h.text.strip()}")

        return data

    def scrape_site(self, start_url: str, max_pages: int = 10) -> List[Dict]:
        """Scrape multiple pages from a site starting from a given URL"""
        visited = set()
        # Properly join the base URL with the start URL
        full_start_url = urljoin(self.base_url, start_url)
        to_visit = [full_start_url]
        results = []

        while to_visit and len(visited) < max_pages:
            url = to_visit.pop(0)
            if url in visited:
                continue

            self.logger.info(f"Scraping {url}")
            data = self.scrape_page(url)
            if data:
                results.append(data)
                visited.add(url)

                # Find more links to scrape
                response = self._make_request(url)
                if response:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    for link in soup.find_all('a', href=True):
                        next_url = urljoin(self.base_url, link['href'])
                        if (
                            next_url.startswith(self.base_url) and
                            next_url not in visited and
                            next_url not in to_visit
                        ):
                            to_visit.append(next_url)

        return results

    def save_results(self, results: List[Dict], filename: str):
        """Save scraped results to a JSON file"""
        output_path = self.output_dir / filename
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        self.logger.info(f"Saved results to {output_path}")

# Example usage:
# scraper = EduWebScraper('https://example-university.edu')
# results = scraper.scrape_site('/admissions', max_pages=5)
# scraper.save_results(results, 'university_admissions.json')