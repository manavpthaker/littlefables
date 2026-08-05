#!/usr/bin/env python3
"""Test the company scraper with a few target companies."""

import asyncio
import logging
import json
from agents.company_scraper import CompanyScraper

async def test_company_scraper():
    """Test scraping from company career sites."""
    
    # Set up logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    logger = logging.getLogger(__name__)
    
    print("\n🔍 Testing Company Career Site Scraper")
    print("=" * 60)
    
    # Test companies (start with a few)
    test_companies = [
        {'name': 'Stripe', 'careers_url': 'https://stripe.com/jobs'},
        {'name': 'Databricks', 'careers_url': 'https://databricks.com/company/careers'},
        {'name': 'Notion', 'careers_url': 'https://notion.so/careers'},
        {'name': 'Anthropic', 'careers_url': 'https://anthropic.com/careers'},
        {'name': 'OpenAI', 'careers_url': 'https://openai.com/careers'},
    ]
    
    # Initialize scraper
    scraper = CompanyScraper(logger)
    
    # Scrape companies
    print("\n📊 Scraping company career sites...")
    all_jobs = await scraper.scrape_companies(test_companies)
    
    # Display results
    print(f"\n✅ Found {len(all_jobs)} total jobs")
    
    # Group by company
    by_company = {}
    for job in all_jobs:
        company = job.get('company', 'Unknown')
        if company not in by_company:
            by_company[company] = []
        by_company[company].append(job)
    
    # Show results by company
    print("\n📈 Results by Company:")
    for company, jobs in by_company.items():
        print(f"\n{company}: {len(jobs)} jobs")
        for job in jobs[:3]:  # Show first 3 jobs per company
            print(f"  • {job.get('title', 'No title')}")
            print(f"    Location: {job.get('location', 'Not specified')}")
            print(f"    URL: {job.get('url', 'No URL')}")
    
    # Save results to file
    output_file = 'data/results/company_scraper_test.json'
    with open(output_file, 'w') as f:
        json.dump({
            'timestamp': asyncio.get_event_loop().time(),
            'companies_tested': len(test_companies),
            'total_jobs_found': len(all_jobs),
            'jobs_by_company': {company: len(jobs) for company, jobs in by_company.items()},
            'sample_jobs': all_jobs[:10]
        }, f, indent=2, default=str)
    
    print(f"\n💾 Results saved to {output_file}")
    
    # Test specific parsers
    print("\n🧪 Testing Individual Parsers:")
    
    # Test Microsoft parser
    print("\n  Testing Microsoft parser...")
    microsoft_jobs = await scraper.scrape_microsoft("https://careers.microsoft.com")
    print(f"  ✓ Microsoft: {len(microsoft_jobs)} jobs found")
    
    # Test Google parser  
    print("  Testing Google parser...")
    google_jobs = await scraper.scrape_google("https://careers.google.com")
    print(f"  ✓ Google: {len(google_jobs)} jobs found")
    
    # Summary
    print("\n" + "=" * 60)
    print("Summary:")
    print(f"  • Companies tested: {len(test_companies)}")
    print(f"  • Total jobs found: {len(all_jobs)}")
    print(f"  • Average jobs per company: {len(all_jobs) / len(test_companies):.1f}")
    
    if len(all_jobs) > 0:
        print("\n✅ Company scraper is working! You can now scrape directly from company sites.")
        print("This bypasses the anti-bot measures on LinkedIn/Indeed/AngelList.")
    else:
        print("\n⚠️ No jobs found. This might be due to:")
        print("  • API rate limiting")
        print("  • Changed API endpoints")
        print("  • Network issues")
        print("  • Companies requiring authentication")

if __name__ == "__main__":
    asyncio.run(test_company_scraper())