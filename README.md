# Youtube Explorer

I built this app because I wanted to rediscover older youtube viral videos to
provide my daily source of inspiration, knowledge, and laughter.

The application is fully responsive and has the following features
that were implemented from scratch: instant search, autocomplete suggestions,
infinite scroll, history state, date manipulation, search results,
and video embedding. I chose to use jQuery to really get my hands dirty
and work with the DOM.

Tech stack: Node, Express, Nunjucks, jQuery, and CSS.

## Development Setup

You will need to obtain a Youtube API key and set this environment variable.

```bash
export YOUTUBE_EXPLORER_API='YOUR API KEY'
```

Then setup and run the application:

```
npm install
nodemon app.js
```
