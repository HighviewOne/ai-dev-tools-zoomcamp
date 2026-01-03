import requests

def scrape_web(url: str) -> str:
    """Scrape the content of a web page and return it as markdown."""
    jina_url = f"https://r.jina.ai/{url}"
    response = requests.get(jina_url)
    response.raise_for_status()
    return response.text

# Test scraping the minsearch repo
url = "https://github.com/alexeygrigorev/minsearch"
content = scrape_web(url)
print(f"Number of characters returned: {len(content)}")
print("\n--- First 500 characters ---")
print(content[:500])
