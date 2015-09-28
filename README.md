# Youtube Explorer

Realtime youtube search app.

Tech stack: Node, Express, Nunjucks, jQuery, and CSS.

The application is fully responsive and has the following features that were
implemented from scratch: instant search, infinite scroll, history state,
and video embedding.

## Development Setup

You will need to obtain an API key from youtube and set this environment
variable to that key to gain access to the youtube API.

```bash
export HORIZON_YOUTUBE_API='YOUR API KEY'
```

Then setup and run the application:

```
npm install
nodemon app.js
localhost:8081
```
