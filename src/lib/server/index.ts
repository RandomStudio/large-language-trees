import { drizzle } from "drizzle-orm/aws-data-api/pg";
import { RDSDataClient } from "@aws-sdk/client-rds-data";
import { fromIni } from "@aws-sdk/credential-providers";
const rdsClient = new RDSDataClient({
  credentials: fromIni({ profile: process.env["PROFILE"] }),
  region: "eu-north-1c",
});
const db = drizzle(rdsClient, {
  database: process.env["DATABASE"]!,
  secretArn: process.env["SECRET_ARN"]!,
  resourceArn: process.env["RESOURCE_ARN"]!,
});
