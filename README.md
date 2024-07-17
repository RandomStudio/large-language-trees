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
OPENAI_API_KEY=*******************************
DB_CONNECTION_STRING=*******************************
PLACEHOLDER_IMAGES=false
AWS_ACCESS_KEY_ID_S3=*******************************
AWS_SECRET_ACCESS_KEY_S3==*******************************
BACKGROUND_FN_SECRET==doesnotmatter
BACKGROUND_FN_USES_LOCAL_API=http://localhost:8888
ADMIN_GARDEN_SHARED=true
S3_REGION=eu-north-1
S3_BUCKET=random-the-garden
```

... where `****` must be replaced with the correct keys or URL strings. Ask for these if you don't have them!

## Using local database and local netlify background functions

The `npm run dev` script will assume you want to use a local database (instead of AWS-hosted DB) and run a local "Netlify CLI" server so that background functions will run on your machine.

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

## Using Drizzle Studio

Assuming the site is up and running on your development environment (`npm run dev`), you can open a new terminal console and run:

```
npm run dev:drizzle-studio
```

This will connect to the local database and the Studio interface will be available at https://local.drizzle.studio
