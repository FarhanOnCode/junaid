import os
import re
from datetime import datetime

directory = r"c:\Users\Administrator\Desktop\junaid"
html_files = [f for f in os.listdir(directory) if f.endswith('.html')]

# 1. Create sitemap.xml
base_url = "https://www.junaidonline.com/"
sitemap_content = ['<?xml version="1.0" encoding="UTF-8"?>']
sitemap_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

for file in html_files:
    loc = base_url if file == 'index.html' else f"{base_url}{file}"
    sitemap_content.append('  <url>')
    sitemap_content.append(f'    <loc>{loc}</loc>')
    sitemap_content.append(f'    <lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod>')
    sitemap_content.append('    <changefreq>monthly</changefreq>')
    priority = "1.0" if file == 'index.html' else "0.8"
    sitemap_content.append(f'    <priority>{priority}</priority>')
    sitemap_content.append('  </url>')
sitemap_content.append('</urlset>')

with open(os.path.join(directory, 'sitemap.xml'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(sitemap_content))
print("Created sitemap.xml")

# 2. Create robots.txt
robots_content = f"User-agent: *\nAllow: /\n\nSitemap: {base_url}sitemap.xml\n"
with open(os.path.join(directory, 'robots.txt'), 'w', encoding='utf-8') as f:
    f.write(robots_content)
print("Created robots.txt")

# 3. Fix resume.html missing SEO tags
resume_path = os.path.join(directory, 'resume.html')
if os.path.exists(resume_path):
    with open(resume_path, 'r', encoding='utf-8') as f:
        resume_html = f.read()

    if "og:title" not in resume_html:
        seo_tags = """
  <!-- ═══════════════════════════════════════
       SEO META TAGS
  ═══════════════════════════════════════ -->
  <meta name="robots" content="index, follow" />
  <meta name="author" content="Mohammed Junaid" />
  <link rel="canonical" href="https://www.junaidonline.com/resume.html" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.junaidonline.com/resume.html" />
  <meta property="og:title" content="Resume | Mohammed Junaid — Digital Marketing Expert" />
  <meta property="og:description" content="View and download Mohammed Junaid's digital marketing resume." />
  <meta property="og:image" content="https://www.junaidonline.com/profile.jpeg" />
  <meta name="twitter:card" content="summary_large_image" />
"""
        resume_html = resume_html.replace('</style>', '</style>\n' + seo_tags)
        with open(resume_path, 'w', encoding='utf-8') as f:
            f.write(resume_html)
        print("Added SEO tags to resume.html")

# 4. Remove duplicate Person schema from all files
# The duplicate is the second script that starts with @type Person.
# We'll use a regex that matches the entire script tag containing exactly this duplicate.
# In the source files, it looks like:
#   <script type="application/ld+json">
#   {
#       "@context": "https://schema.org",
#       "@type": "Person",
#       ...
#   }
#   </script>
pattern = re.compile(r'\s*<script type="application/ld\+json">\s*\{\s*"@context": "https://schema\.org",\s*"@type": "Person".*?\}\s*\}\s*</script>', re.DOTALL)

for file in html_files:
    file_path = os.path.join(directory, file)
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to remove it ONLY if there's more than one ld+json script, or if the file already has an embedded one.
    # The simplest way is to just find the exact block and remove it. The first block is "@type": "AboutPage" or "WebSite".
    # Wait, the first block in some pages might ALSO be "Person". Let's check.
    # Actually, the regex specifically looks for the one with 6 spaces before "@context", which is the duplicated one we saw.
    # But regex `\s*\{\s*"@context": "https://schema\.org",\s*"@type": "Person"` will match ANY Person schema.
    # Let's count how many ld+json scripts are in the file.
    
    scripts = re.findall(r'<script type="application/ld\+json">.*?</script>', content, re.DOTALL)
    if len(scripts) > 1:
        # If there are multiple, remove the last one if it's the duplicate Person
        last_script = scripts[-1]
        if '"@type": "Person"' in last_script:
            new_content = content.replace(last_script, '', 1)
            # also remove any leftover whitespace
            new_content = new_content.replace('  \n  <script src="https://unpkg.com/lucide@latest"></script>', '  <script src="https://unpkg.com/lucide@latest"></script>')
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Removed duplicate schema from {file}")

print("SEO Optimization Complete.")
