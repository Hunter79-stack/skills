#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI Research Scraper - 抓取AI领域最新研究信息的脚本

该脚本从多个AI领域的知名网站抓取信息，重点关注AI产品发展方面的内容，
并提供简洁的摘要和原始网页链接。
"""

import argparse
import requests
import time
import random
import re
import json
import os
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse


def read_websites():
    """从文件读取要抓取的网站列表"""
    websites = []
    try:
        with open('/root/.openclaw/workspace/skills/ai-research-scraper/references/websites.txt', 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    parts = line.split('|')
                    if len(parts) >= 2:
                        websites.append({
                            'name': parts[0],
                            'url': parts[1],
                            'rss': parts[2] if len(parts) > 2 else None
                        })
    except FileNotFoundError:
        print("未找到websites.txt文件，使用默认网站列表")
        websites = get_default_websites()
    return websites


def get_default_websites():
    """返回默认的AI领域网站列表"""
    return [
        {
            'name': 'TechCrunch',
            'url': 'https://techcrunch.com/',
            'rss': 'https://techcrunch.com/feed/'
        },
        {
            'name': 'VentureBeat',
            'url': 'https://venturebeat.com/',
            'rss': 'https://venturebeat.com/feed/'
        },
        {
            'name': 'MIT Tech Review',
            'url': 'https://www.technologyreview.com/',
            'rss': 'https://www.technologyreview.com/feed/'
        },
        {
            'name': 'ZDNet',
            'url': 'https://www.zdnet.com/',
            'rss': 'https://www.zdnet.com/feed/'
        },
        {
            'name': 'Wired',
            'url': 'https://www.wired.com/',
            'rss': 'https://www.wired.com/feed/'
        },
        {
            'name': 'Ars Technica',
            'url': 'https://arstechnica.com/',
            'rss': 'https://arstechnica.com/feed/'
        }
    ]


def save_websites(websites):
    """保存网站列表到文件"""
    with open('/root/.openclaw/workspace/skills/ai-research-scraper/references/websites.txt', 'w', encoding='utf-8') as f:
        f.write("# AI领域知名网站列表\n")
        f.write("# 格式: 网站名称|网站URL|RSS/Feed URL（可选）\n\n")
        for site in websites:
            line = f"{site['name']}|{site['url']}"
            if site.get('rss'):
                line += f"|{site['rss']}"
            f.write(line + "\n")


def scrape_website(site, max_tokens):
    """抓取单个网站的信息"""
    print(f"\n正在抓取: {site['name']}")
    
    try:
        # 添加随机延迟，避免被封禁
        time.sleep(random.uniform(1, 3))
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # 增加超时时间和重试机制
        retries = 3
        backoff_factor = 2
        
        for attempt in range(retries):
            try:
                response = requests.get(site['url'], headers=headers, timeout=10)
                response.raise_for_status()
                break
            except Exception as e:
                if attempt == retries - 1:
                    raise e
                wait_time = backoff_factor * (attempt + 1)
                print(f"  第{attempt + 1}次抓取失败，{wait_time}秒后重试: {str(e)}")
                time.sleep(wait_time)
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 尝试从RSS获取信息，或者直接抓取网页
        if site.get('rss'):
            return scrape_rss(site['rss'], site['name'], max_tokens)
        else:
            return scrape_html(soup, site['url'], site['name'], max_tokens)
            
    except Exception as e:
        print(f"  抓取失败: {str(e)}")
        return []


def scrape_rss(rss_url, site_name, max_tokens):
    """从RSS/Feed获取信息"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # 增加超时时间和重试机制
        retries = 3
        backoff_factor = 2
        
        for attempt in range(retries):
            try:
                response = requests.get(rss_url, headers=headers, timeout=10)
                response.raise_for_status()
                break
            except Exception as e:
                if attempt == retries - 1:
                    raise e
                wait_time = backoff_factor * (attempt + 1)
                print(f"  第{attempt + 1}次抓取RSS失败，{wait_time}秒后重试: {str(e)}")
                time.sleep(wait_time)
        
        soup = BeautifulSoup(response.content, 'xml')
        items = soup.find_all('item') or soup.find_all('entry')
        
        results = []
        for item in items[:5]:  # 增加到取最新的5篇文章
            try:
                title = item.find('title').text.strip()
                link = item.find('link')
                if hasattr(link, 'text'):
                    link = link.text.strip()
                elif 'href' in link.attrs:
                    link = link['href']
                
                summary = ''
                description = item.find('description') or item.find('summary')
                if description:
                    summary = clean_html(description.text.strip())
                
                # 检查是否包含AI产品相关的关键词
                if is_related_to_product_development(title, summary):
                    summary = truncate_text(summary, max_tokens)
                    results.append({
                        'site': site_name,
                        'title': title,
                        'summary': summary,
                        'link': link
                    })
            
            except Exception as e:
                print(f"  处理RSS条目失败: {str(e)}")
                continue
                
        return results
        
    except Exception as e:
        print(f"  抓取RSS失败: {str(e)}")
        return []


def scrape_html(soup, base_url, site_name, max_tokens):
    """从HTML网页直接抓取信息"""
    results = []
    
    # 常见的文章标题和链接选择器
    selectors = [
        ('h2', 'a'), ('h3', 'a'), ('article', 'a'),
        ('.post-title', 'a'), ('.entry-title', 'a'),
        ('.article-title', 'a'), ('.blog-post-title', 'a')
    ]
    
    for title_selector, link_selector in selectors:
        elements = soup.select(f"{title_selector} {link_selector}")
        if elements:
            for element in elements[:3]:  # 只取最新的3篇文章
                try:
                    title = element.text.strip()
                    link = element.get('href')
                    link = urljoin(base_url, link)
                    
                    # 尝试获取文章摘要
                    summary = ''
                    parent = element.find_parent()
                    if parent:
                        # 查找相邻的段落或摘要元素
                        summary_element = parent.find_next('p')
                        if summary_element:
                            summary = clean_html(summary_element.text.strip())
                    
                    # 检查是否包含AI产品相关的关键词
                    if is_related_to_product_development(title, summary):
                        summary = truncate_text(summary, max_tokens)
                        results.append({
                            'site': site_name,
                            'title': title,
                            'summary': summary,
                            'link': link
                        })
                    
                except Exception as e:
                    print(f"  处理HTML元素失败: {str(e)}")
                    continue
    
    return results


def is_related_to_product_development(title, summary):
    """检查内容是否与AI产品发展相关"""
    # 先检查是否包含AI相关的关键词
    ai_keywords = ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network']
    
    # 再检查是否包含产品发展相关的关键词
    product_keywords = [
        'product', 'launch', 'release', 'feature', 'update', 'announcement',
        'api', 'platform', 'tool', 'framework', 'library', 'service',
        'deployment', 'integration', 'use case', 'application', 'solution',
        'demo', 'preview', 'beta', 'version'
    ]
    
    text = (title + ' ' + summary).lower()
    
    # 必须同时包含AI相关和产品发展相关的关键词
    has_ai = any(keyword in text for keyword in ai_keywords)
    has_product = any(keyword in text for keyword in product_keywords)
    
    return has_ai and has_product


def clean_html(text):
    """去除HTML标签和多余的空白"""
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def truncate_text(text, max_tokens):
    """截断文本到指定的token数（近似值）"""
    if not text:
        return ''
    
    words = text.split()
    if len(words) <= max_tokens:
        return text
    
    return ' '.join(words[:max_tokens]) + '...'


def print_results(results, max_tokens):
    """打印抓取结果"""
    if not results:
        print("\n未找到与AI产品发展相关的最新信息")
        return
    
    print(f"\n找到 {len(results)} 条与AI产品发展相关的最新信息:")
    print("-" * 80)
    
    for i, result in enumerate(results, 1):
        print(f"\n{i}. [{result['site']}] {result['title']}")
        print(f"   摘要: {result['summary']}")
        print(f"   链接: {result['link']}")
    
    print("\n" + "-" * 80)
    print(f"总共有 {len(results)} 条信息，摘要长度限制为 {max_tokens} 个token")


def main():
    parser = argparse.ArgumentParser(description='AI Research Scraper')
    parser.add_argument('--max-tokens', type=int, default=300, help='最大摘要长度（token数，默认300）')
    parser.add_argument('--days', type=int, default=7, help='只获取最近几天的信息（默认7天）')
    parser.add_argument('--topic', type=str, default='product-development', help='主题筛选（默认产品开发）')
    parser.add_argument('--no-cache', action='store_true', help='不使用缓存（默认使用）')
    args = parser.parse_args()
    
    print("AI Research Scraper - 抓取AI产品发展相关信息")
    print("=" * 80)
    
    # 确保网站列表文件存在
    save_websites(read_websites())
    
    # 检查是否使用缓存
    cache_file = '/root/.openclaw/workspace/skills/ai-research-scraper/.cache'
    current_time = time.time()
    cache_valid = False
    
    if not args.no_cache and os.path.exists(cache_file):
        try:
            with open(cache_file, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)
            cache_time = cache_data.get('time', 0)
            cache_valid = (current_time - cache_time) < 3600  # 1小时内的缓存有效
            if cache_valid:
                print("正在使用缓存数据...")
                print_results(cache_data.get('results', []), args.max_tokens)
                return
        except Exception as e:
            print(f"  读取缓存失败: {str(e)}")
    
    # 先检查网络连接
    print("正在检查网络连接...")
    network_ok = False
    test_urls = ['https://www.google.com', 'https://github.com']
    
    for url in test_urls:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                network_ok = True
                print(f"  网络连接正常")
                break
        except Exception as e:
            print(f"  网络连接检查失败: {str(e)}")
    
    if not network_ok:
        print("网络连接异常，无法获取最新信息")
        # 尝试使用缓存（如果有）
        if os.path.exists(cache_file):
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    cache_data = json.load(f)
                print("正在使用缓存数据...")
                print_results(cache_data.get('results', []), args.max_tokens)
            except Exception as e:
                print(f"  读取缓存失败: {str(e)}")
        return
    
    # 抓取所有网站信息
    all_results = []
    for site in read_websites():
        results = scrape_website(site, args.max_tokens)
        all_results.extend(results)
    
    # 去重（基于链接）
    seen_links = set()
    unique_results = []
    for result in all_results:
        if result['link'] not in seen_links:
            seen_links.add(result['link'])
            unique_results.append(result)
    
    # 保存缓存
    try:
        cache_data = {
            'time': current_time,
            'results': unique_results
        }
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f)
    except Exception as e:
        print(f"  保存缓存失败: {str(e)}")
    
    print_results(unique_results, args.max_tokens)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"程序执行出错: {str(e)}")
        import traceback
        print(traceback.format_exc())
