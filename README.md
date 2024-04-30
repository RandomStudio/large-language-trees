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

## Using local database and local file storage

The `npm run dev` script will assume you want to use the local database (instead of AWS-hosted DB) and local filesystem storage (instead of AWS S3) by default.

### DB

To avoid messing with the live/production database (on AWS), you should run a local instance of PostgreSQL database, e.g. using Docker:

```
docker run --name some-postgres -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres
```

The first time you run the local database:

```
npm run dev:drizzle-generate
```

then

```
npm run dev:drizzle-push
```

Create a `.env.development` file with identical contents to `.env` _except_ for the following line:

```
DB_CONNECTION_STRING=postgresql://postgres:mysecretpassword@localhost:5432
```

### File storage

In the same `.env.development` file as above, ensure that you have a line:

```
LOCAL_FILES=true
```

In addition, you can also skip image generation via OpenAI altogether. This helps to make testing faster and won't cost anything - a placeholder image will be returned instead.

```
PLACEHOLDER_IMAGES=true
```

## Using Drizzle Studio

Assuming the site is up and running on your development environment (`npm run dev`), you can open a new terminal console and run:

```
npm run dev:drizzle-studio
```

This will connect to the local database and the Studio interface will be available at https://local.drizzle.studio
