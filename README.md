# Large Language Trees

A garden of hallucinated delights.

## Development setup

- Clone
- `cd large-language-trees`
- Install: `npm install`
- Run: `npm run dev` ... _but you need environmental variables - see below!_

## Environment variables

The keys for the live database (on AWS) and OpenAI (ChatGPT/Dall-E) are deliberately _not_ stored in this repository. That means you need to provide these on your system while testing in development.

- Create a `.env` file (you must include the `.` !) in the root of the project folder
- Add the following lines:

```
OPENAI_API_KEY=*****************************
DB_CONNECTION_STRING=**********************
```

... where `****` must be replaced with the correct keys or URL strings. Ask for these if you don't have them!
