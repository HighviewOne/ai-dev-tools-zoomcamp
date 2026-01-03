from fastmcp import FastMCP
import requests
import os
import zipfile
from minsearch import Index

mcp = FastMCP("Demo 🚀")

# Global variable to hold the search index
_search_index = None
_documents = None

ZIP_URL = "https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip"
ZIP_FILE = "fastmcp-main.zip"


@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b


@mcp.tool
def scrape_web(url: str) -> str:
    """Scrape the content of a web page and return it as markdown.
    
    Args:
        url: The URL of the web page to scrape
        
    Returns:
        The content of the web page in markdown format
    """
    jina_url = f"https://r.jina.ai/{url}"
    response = requests.get(jina_url)
    response.raise_for_status()
    return response.text


def _download_zip_if_needed():
    """Download the zip file if it doesn't already exist."""
    if os.path.exists(ZIP_FILE):
        return
    
    response = requests.get(ZIP_URL, stream=True, timeout=60)
    response.raise_for_status()
    
    with open(ZIP_FILE, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)


def _extract_md_files_from_zip():
    """
    Extract all .md and .mdx files from the zip file.
    Returns a list of dicts with 'filename' and 'content' keys.
    """
    documents = []
    
    with zipfile.ZipFile(ZIP_FILE, 'r') as zip_ref:
        for file_info in zip_ref.infolist():
            if file_info.is_dir():
                continue
            
            if not (file_info.filename.endswith('.md') or file_info.filename.endswith('.mdx')):
                continue
            
            # Remove the first part of the path (e.g., "fastmcp-main/")
            parts = file_info.filename.split('/', 1)
            if len(parts) > 1:
                clean_filename = parts[1]
            else:
                clean_filename = file_info.filename
            
            with zip_ref.open(file_info) as f:
                content = f.read().decode('utf-8', errors='ignore')
            
            documents.append({
                'filename': clean_filename,
                'content': content
            })
    
    return documents


def _get_search_index():
    """Get or create the search index."""
    global _search_index, _documents
    
    if _search_index is None:
        _download_zip_if_needed()
        _documents = _extract_md_files_from_zip()
        _search_index = Index(
            text_fields=['content'],
            keyword_fields=['filename']
        )
        _search_index.fit(_documents)
    
    return _search_index


@mcp.tool
def search_docs(query: str, num_results: int = 5) -> list:
    """Search the FastMCP documentation for relevant documents.
    
    Args:
        query: The search query
        num_results: Number of results to return (default 5)
        
    Returns:
        A list of dictionaries with 'filename' and 'content' for each matching document
    """
    index = _get_search_index()
    results = index.search(query=query, num_results=num_results)
    return [{"filename": r["filename"], "content": r["content"][:500] + "..."} for r in results]


if __name__ == "__main__":
    mcp.run()
