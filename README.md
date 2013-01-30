# ScraperScript

A simple bookmarklet that lets you click any element in a page and returns the smallest unique (and reliable) selector it can find for that element.

**Usecase:** Figuring out a CSS-style selector for screenscraping.

**How to use the selector:** Use your favourite screenscraping library with CSS selector support. If you are using BeautifulSoup, you'll need to use my [patched version](https://github.com/joepie91/beautifulsoup) to have support for :nth-of-type() pseudoselectors as returned by ScraperScript.

**How to make it stop killing my input:** Just click the X in the ScraperScript bar. ScraperScript will release your input.

**How to develop:** Modify the bookmarklet to point at a scraperscript.js that is hosted locally. It's loaded with a cachebuster, so you can simply use the same bookmarklet every time you change the local code.

Known bugs: 

* On certain kinds of elements (some submit buttons, some elements with click events), ScraperScript can't prevent the attached event from happening. I'm unsure what causes this.
* You can't ctrl+C the selector because keyboard input is killed when ScraperScript is running. Needs to be fixed to allow ctrl+C.
