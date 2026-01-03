import os
import zipfile
import requests
from minsearch import Index

ZIP_URL = "https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip"
ZIP_FILE = "fastmcp-main.zip"


def download_zip_if_needed():
    """Download the zip file if it doesn't already exist."""
    if os.path.exists(ZIP_FILE):
        print(f"Zip file already exists: {ZIP_FILE}")
        return
    
    print(f"Downloading {ZIP_URL}...")
    response = requests.get(ZIP_URL, stream=True, timeout=60)
    response.raise_for_status()
    
    with open(ZIP_FILE, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    print(f"Downloaded to {ZIP_FILE}")


def extract_md_files_from_zip():
    """
    Extract all .md and .mdx files from the zip file.
    Returns a list of dicts with 'filename' and 'content' keys.
    The filename has the first path component removed.
    """
    documents = []
    
    with zipfile.ZipFile(ZIP_FILE, 'r') as zip_ref:
        for file_info in zip_ref.infolist():
            # Skip directories
            if file_info.is_dir():
                continue
            
            # Only process .md and .mdx files
            if not (file_info.filename.endswith('.md') or file_info.filename.endswith('.mdx')):
                continue
            
            # Remove the first part of the path (e.g., "fastmcp-main/")
            parts = file_info.filename.split('/', 1)
            if len(parts) > 1:
                clean_filename = parts[1]
            else:
                clean_filename = file_info.filename
            
            # Read the content
            with zip_ref.open(file_info) as f:
                content = f.read().decode('utf-8', errors='ignore')
            
            documents.append({
                'filename': clean_filename,
                'content': content
            })
    
    return documents


def create_index(documents):
    """Create a minsearch index from the documents."""
    index = Index(
        text_fields=['content'],
        keyword_fields=['filename']
    )
    index.fit(documents)
    return index


def search(index, query, num_results=5):
    """Search the index and return the top results."""
    results = index.search(
        query=query,
        num_results=num_results
    )
    return results


def main():
    # Step 1: Download the zip if needed
    download_zip_if_needed()
    
    # Step 2: Extract md/mdx files
    print("Extracting markdown files...")
    documents = extract_md_files_from_zip()
    print(f"Found {len(documents)} markdown files")
    
    # Step 3: Create the search index
    print("Creating search index...")
    index = create_index(documents)
    
    # Step 4: Test search with "demo" query
    print("\nSearching for 'demo'...")
    results = search(index, "demo", num_results=5)
    
    print("\nTop 5 results:")
    for i, result in enumerate(results, 1):
        print(f"{i}. {result['filename']}")
    
    if results:
        print(f"\nFirst file returned: {results[0]['filename']}")


if __name__ == "__main__":
    main()
