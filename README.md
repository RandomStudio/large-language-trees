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
OPENAI_API_KEY=`****`
DB_CONNECTION_STRING=`****`
PLACEHOLDER_IMAGES=false
AWS_ACCESS_KEY_ID_S3=`****`
AWS_SECRET_ACCESS_KEY_S3=`****`
BACKGROUND_FN_SECRET=`****`
ADMIN_GARDEN_SHARED=false
S3_REGION=eu-north-1
S3_BUCKET=random-the-garden
BACKGROUND_FN_USES_LOCAL_API=http://localhost:8888
PUBLIC_TETHER_HOST=localhost
PUBLIC_TETHER_PORT=15675
PUBLIC_TETHER_PROTOCOL=ws
PUBLIC_TETHER_PATH=/ws
```

... where `****` must be replaced with the correct keys or URL strings. Ask for these if you don't have them!

## Using local database, local MQTT broker and local netlify background functions

The `npm run dev` script will assume you want to use a local database (instead of AWS-hosted DB) and run a local "Netlify CLI" server so that background functions will run on your machine.

### Local Database

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

### Local MQTT broker

For realtime messaging (using Tether) to run via a local MQTT broker (recommended!) - you can start up a preconfigured Eclipse Mosquitto broker as follows:

```
docker run --name tether-broker -d -p 15675:9001 -p 1883:1883 randomstudiotools/tether-broker
```

## Using Drizzle Studio

Assuming the site is up and running on your development environment (`npm run dev`), you can open a new terminal console and run:

```
npm run dev:drizzle-studio
```

This will connect to the local database and the Studio interface will be available at https://local.drizzle.studio

## Plant Generation Sequence Diagram

### "Top" user confirms new name

```mermaid
sequenceDiagram
    Frontend->>Server: POST GeneratePlantRequestBody (/api/plants/generate)
    Server-->>DB: promptSettings, plant1, plant2
    DB-->>Server: promptSettings, plant1, plant2
    Server-->>BgFunction: POST BackgroundGenerateTextRequest
    BgFunction-->>Server: 202 Accepted
    Server->>Frontend: { newPlantId }
```

- ...This user gets redirected to "/app/gallery"
- The gallery should now include the "seed" plant with the two "author" user names and the chosen name. The plant is not clickable because it is not ready (sprouted) yet.

### Meanwhile in the background function

BackgroundGenerateTextRequest contains:

- ID strings: `authorTop`, `authorBottom`, `newPlantId`, `parent1id`, `parent2id`
- string `model` (typically, Chat-GTP-4)
- array of `messages` objects (`role`, `content`)
- `backgroundSecret` string used for basic authentication

```mermaid
sequenceDiagram
    BgFunction->>OpenAI: POST: model, messages
    OpenAI-->>BgFunction: message parsed as Plant
    BgFunction->>Server: POST /api/plants/[id]/candidateText
    Server->>DB: update generatedPlants with text-contents
    Server-->>BgFunction: 200 OK
    BgFunction->>Server: POST GenImageToServer /api/images/generate
    Server-->>DB: fetch prompt settings
    DB-->>Server: prompt settings
    Server-->>BgFunction: 200 OK GenImageToBackground (plantId, fullPrompt, model)
    BgFunction->>OpenAI: POST: model, prompt
    OpenAI-->>BgFunction: url*
    BgFunction->>Server: GenerateImageResultBody apit/plants/[id]/candidateImage
    Server->>OpenAI: GET image with URL
    OpenAI-->>Server: image body
    Server-->>S3: Upload image (original, not transparent)
    Server-->>DB: Update generatedPlants: imageUrl, awaitingConfirmation=true
    DB-->>Server: updated generatedPlants entry
    Server->>Tether: EventGeneratedPlantReady
    Server->>BgFunction: 201 Created
```

- ...The "top" user should now see the candidate plant (seed) updated in their gallery with a prompt to click and "sprout" now.
- Note that if the first attempt fails with rate limit detected, then another attempt will be made using Dall-E 2

### Notify "top" user that generated plant awaits confirmation

```mermaid
sequenceDiagram
    Tether-->>FE-Gallery: EventGeneratedPlantReady message
    FE-Gallery-->>FE-ConfirmBreedPopup: candidateChild
    FE-ConfirmBreedPopup-->>FE-TransparencyMaker: candidateImageUrl
    FE-TransparencyMaker-->>Server: formData api/images/upload
    Server-->>S3: image as Blob
    Server-->>FE-TransparencyMaker: 201 Created, { url }
    FE-TransparencyMaker-->>FE-ConfirmBreedPopup: replaced url
```

### "Top" user clicks OK to confirm

```mermaid
sequenceDiagram
    FE-ConfirmBreedPopup-->PollinationFrontendFunctions: InsertPlant
    PollinationFrontendFunctions->>Server: InsertPlant (/api/plants)
    Server-->>DB: insert new Plant
    Server-->>PollinationFrontendFunctions: 201 Created
    PollinationFrontendFunctions->>Server: DELETE /api/plants/[id]/generatedPlant
    Server-->>DB: delete from generatedPlants
    Server-->>PollinationFrontendFunctions: 202 Accepted
    PollinationFrontendFunctions-->>Server: THIS USER plantId, userId (api/plantsInGarden)
    Server-->>DB: add entry gardensToPlants
    Server-->>PollinationFrontendFunctions: 201 Created
    PollinationFrontendFunctions-->>Server: OTHER USER plantId, userId (api/plantsInGarden)
    Server-->>DB: add entry gardensToPlants
    Server-->>PollinationFrontendFunctions: 201 Created
    PollinationFrontendFunctions->>Tether: EventNewSprouting message
```

...Both this user ("top") and other user ("bottom") should receive the EventNewSprouting message and reload gallery as necessary.
