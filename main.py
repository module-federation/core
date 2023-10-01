# To run this script you need Python setup and installed chardet and beautifulsoup dependencies through pip install


import os
import chardet
from bs4 import BeautifulSoup

# This is basic config

INPUT_DIR = 'docs/index.html' # TypeDoc assinged docs dir,
OUTPUT_NAV_ADOC = 'apps/docs/src/en/modules/ROOT/nav.adoc' # Your desired nav file to put pages nav
OUTPUT_PAGES_DIR = 'apps/docs/src/en/modules/ROOT/pages' # Your desired location

def process_code_tag(tag):
    # Apply desired replacements to the HTML content
    cleaned_html = (
        tag.decode_contents()
        .replace('  ', '__')
        .replace('<br>', '\n')
        .replace('<br/>', '\n')
        .replace('<button>Copy</button>', '')
    )

    # Convert the cleaned HTML to Beautiful Soup object
    cleaned_soup = BeautifulSoup(cleaned_html, "html.parser")

    # Extract text content from the cleaned soup
    code_text = cleaned_soup.get_text()

    return f"[source, javascript]\n----\n{code_text}\n----\n\n"

def process_div_or_p_tag(tag):
    # Apply desired replacements to the HTML content
    cleaned_html = (
        tag.decode_contents()
        .replace('<code>', '`')
        .replace('</code>', '`')
        .replace('<strong>', '*')
        .replace('</strong>', '*')
    )

    for link in tag.find_all('a'):
        xref = link.get("href")
        link_text = link.get_text().strip()
        cleaned_html = cleaned_html.replace('<a ', f"{xref}[{link_text}] <a ")
        start = cleaned_html.index('<a ')
        end = cleaned_html.index('</a>') + 3
        if len(cleaned_html) > end:
            cleaned_html = cleaned_html[0: start:] + cleaned_html[end + 1::]

    # Convert the cleaned HTML to Beautiful Soup object
    cleaned_soup = BeautifulSoup(cleaned_html, "html.parser")

    # Extract text content from the cleaned soup
    content = cleaned_soup.get_text().strip()

    return f"{content}\n\n"

def process_content_section(content_section, adoc_content):
  for tag in content_section.find_all():
      if tag.name in {"h1", "h2", "h3", "h4"}:
          heading_level = int(tag.name[1])  # Convert heading level to integer
          heading_text = tag.get_text().strip()
          adoc_content += f"{'=' * heading_level} {heading_text}\n\n"

      elif tag.name == "pre":
          adoc_content += process_code_tag(tag).replace('__', '  ')

      elif tag.name == "ul":
          for li in tag.find_all("li"):
              li_text = li.get_text().strip()
              adoc_content += f"* {li_text}\n"
          adoc_content += "\n"

      elif tag.name == "div" or tag.name == "p":
           adoc_content += process_div_or_p_tag(tag)

  return adoc_content

def update_nav_adoc(antora_links):
    # Find the position to replace '.Packages' section
    # Append antora_output.adoc to nav.adoc and replace '.Packages' section
    adoc_output_filename = OUTPUT_NAV_ADOC
    with open(adoc_output_filename, "r", encoding="utf-8") as test_adoc_file:
       nav_adoc_content = test_adoc_file.read()

    # Find the position to replace '.Packages' section
    packages_start = nav_adoc_content.find(".Packages")
    if packages_start != -1:
        packages_end = nav_adoc_content.find("\n\n", packages_start) + 2
        if packages_end != -1:
            new_nav_adoc_content = (
                nav_adoc_content[:packages_start] +
                '.Packages\n' +
                "\n".join(antora_links) +
                "\n\n" +
                nav_adoc_content[packages_end:]
            )
            with open(adoc_output_filename, "w", encoding="utf-8") as new_nav_adoc_file:
                new_nav_adoc_file.write(new_nav_adoc_content)
                print(f"Updated {adoc_output_filename} with antora_output.adoc content.")
        else:
            print(".Packages end not found in nav.adoc.")
    else:
        print(".Packages section not found in nav.adoc.")
        # Append content of antora_output.adoc to nav.adoc
        with open(adoc_output_filename, "a", encoding="utf-8") as nav_adoc_file:
            nav_adoc_file.write('.Packages\n' + "\n".join(antora_links) + "\n\n")
            print(f"Appended content of antora_output.adoc to {adoc_output_filename}.")

def update_pages_directory():
    #  Move generated .adoc files to pages dir
    output_directory = OUTPUT_PAGES_DIR
    for generated_filename in os.listdir():
        if generated_filename.endswith(".adoc"):
            generated_file_path = os.path.join(generated_filename)
            destination_path = os.path.join(output_directory, generated_filename)
            if os.path.exists(destination_path):
                os.remove(destination_path)  # Remove existing file
            os.rename(generated_file_path, destination_path)
            print(f"Moved {generated_filename} to {output_directory}.")

def process_docs(ul_element):
    antora_links = []

    # Iterate through <li> elements inside <ul>
    for li in ul_element.find_all("li"):
        link = li.find("a")
        if link:
            href = link.get("href")
            link_text = link.get_text().strip()

            # Remove '_' at position 0 and replace remaining underscores with hyphens
            module_name = os.path.splitext(os.path.basename(href))[0]
            module_name = module_name[1:].replace("_", "-")

            # Construct full path to the corresponding .html file
            html_path = os.path.join("docs", href)

            # Check if the HTML file exists before reading and parsing
            if os.path.exists(html_path):
                # Read and parse the .html content
                with open(html_path, "rb") as html_file:
                    html_content = html_file.read()

                # Parse the .html content using Beautiful Soup
                html_soup = BeautifulSoup(html_content, "html.parser")

                # Find the content section
                content_section = html_soup.find("section", class_="tsd-panel tsd-typography")

                if content_section:
                    # Convert <code> tags to Antora code blocks while preserving other text
                    adoc_filename = f"{module_name}.adoc"
                    adoc_content = f"= {link_text}\n\n"

                    adoc_content = process_content_section(content_section, adoc_content)

                    # Create the .adoc file with UTF-8 encoding
                    with open(adoc_filename.replace("/", "-"), "w", encoding="utf-8") as adoc_file:
                        adoc_file.write(adoc_content)

                    antora_link = f"* xref:{adoc_filename}[{link_text}]"
                    antora_links.append(antora_link)
            else:
                print(f"HTML file '{html_path}' does not exist.")

    return antora_links


if __name__ == '__main__':
    # Read the HTML file in binary mode
    with open(INPUT_DIR, "rb") as file:
        html_content = file.read()

    # Detect the encoding of the HTML content
    result = chardet.detect(html_content)
    encoding = result["encoding"]

    # Parse the HTML content using Beautiful Soup
    soup = BeautifulSoup(html_content.decode(encoding), "html.parser")

    # Find the <ul> element with the specified class
    ul_element = soup.find("ul", class_="tsd-small-nested-navigation")

    if ul_element:
        # Lists to store Antora links and individual HTML files
        antora_links = process_docs(ul_element)

        update_nav_adoc(antora_links)

        update_pages_directory()

        print("All tasks completed.")
    else:
        print("UL element not found in the HTML.")
