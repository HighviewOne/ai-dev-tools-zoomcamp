# MCP Homework - Context7 Clone

This project implements an MCP server that serves as a documentation search engine, similar to Context7.

## Setup

```bash
pip install uv
uv init
uv add fastmcp requests minsearch
```

## Running the Server

```bash
uv run python main.py
```

Or with the full path for MCP integration:
```bash
uv --directory /path/to/mcp-homework run python main.py
```

## Tools Available

1. **add(a, b)** - Add two numbers
2. **scrape_web(url)** - Scrape web content using Jina Reader
3. **search_docs(query, num_results)** - Search FastMCP documentation

## Homework Answers

### Question 1: First hash in wheels section of fastmcp
**Answer:** `sha256:e33cd622e1ebd5110af6a981804525b6cd41072e3c7d68268ed69ef3be651aca`

### Question 2: FastMCP Transport
**Answer:** STDIO

### Question 3: Characters from minsearch repo
**Answer:** 29184 (closest option)

### Question 4: Count of "data" on datatalks.club
**Answer:** 61 (closest option - varies based on exact implementation)

### Question 5: First file returned for "demo" query
**Answer:** examples/testing_demo/README.md

## Files

- `main.py` - Main MCP server with all tools
- `search.py` - Standalone search implementation for testing
- `test.py` - Test file for the scrape_web function
