## A scraped Solar System
An exercise in [scraping HTML using Node and Cheerio](https://github.com/sansSpoon/scraped-solar-system).

I needed some data for [Planet-Decision](https://github.com/sansSpoon/planetDecision-client). I could have used a publicly available API that hosts the solar system data, but I wanted to host my own and learn along the way.

Although it's probably not technically accurate, I decided to get my data from Wikipedia. The main challenge was the discrepancy of data between planets. There is no hardened rules for formatting a wiki page. Originally I was writing a lot of conditional logic with Cheerio selects to account for the differences. By the time I got to the third planet, I realised it was unmanageable. Instead, I ended up selecting a much higher level element and switching to regex. Once I had the table cell's contents, I could get the needed data more efficiently.

I also had the planets as arguments being passed in via the command line. I did this so the initial scraper could be used as a template. I ended up inlining the url's after realising that scraping is inherently targeted.

The end result is a JSON file that I can import into my API.