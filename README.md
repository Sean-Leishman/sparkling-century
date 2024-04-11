# Sparking Century: SpaCe 
A web application built using SvelteKit to visualise satellite trajectory in realtime.
Visualisation is done using three.js and satellite data is fetched from [N2YO](https://n2yo.com/api).

## Setup
The setup requires a key so create a `.env` file in the root directory and add the following line:
```bash
SWOP_API_KEY=your_key_here
```
The API key can be generated after creating an account on [N2YO](https://n2yo.com/api).

## Developing

Install dependencies with `npm install` and start the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building
```bash
npm run build
```
