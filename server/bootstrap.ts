import { Strapi } from "@strapi/strapi";
import _ from "lodash";
import createFilterMiddleware from "./utils/middleware";
import {Knex} from "knex";
import {createLocationSubscriber, createPolygonSubscriber} from "./utils/lifecycles";
const locaitonServiceUid = "plugin::location-plugin.locationServices";

export default async ({ strapi }: { strapi: Strapi }) => {
  if (!strapi["location-plugin"].enabled) {
      strapi.log.info(`strapi-location-plugin disabled`);
    return;
  }
  const db = strapi.db.connection;

  await Promise.all([
      ...buildLocationQueries(db),
      ...buildPolygonQueries(db)
  ]);

  const locationSubscriber = createLocationSubscriber(strapi);
  //@ts-ignore
  strapi.db.lifecycles.subscribe(locationSubscriber);

  const polygonSubscriber = createPolygonSubscriber(strapi);
  //@ts-ignore
  strapi.db.lifecycles.subscribe(polygonSubscriber);


  const middleware = createFilterMiddleware(strapi);
  strapi.server.use(middleware);
};

function buildLocationQueries(db: Knex) {
    const modelsWithLocation =
        strapi.services[locaitonServiceUid].getModelsWithLocation();

    return modelsWithLocation.map(model => {
        const tableName = model.tableName;

       return strapi.services[locaitonServiceUid].getLocationFields(model.attributes)
           .map(async (locationField) => {
            const locationFieldSnakeCase = _.snakeCase(locationField);
            const hasColumn = await db.schema.hasColumn(
                `${tableName}`,
                `${locationFieldSnakeCase}_geom`
            );
            if (!hasColumn) {
                await db.raw(`
              ALTER TABLE ${tableName}
              ADD COLUMN ${locationFieldSnakeCase}_geom GEOMETRY(Point, 4326);
            `);
            }
            // Generate point column field using only a query
            await db.raw(`
          UPDATE ${tableName}
          SET ${locationFieldSnakeCase}_geom = ST_SetSRID(ST_MakePoint(
              CAST((${locationFieldSnakeCase}::json->'lng')::text AS DOUBLE PRECISION),
              CAST((${locationFieldSnakeCase}::json->'lat')::text AS DOUBLE PRECISION)

          ), 4326)
          WHERE (${locationFieldSnakeCase}::json->'lng')::text != 'null' AND
                (${locationFieldSnakeCase}::json->'lat')::text != 'null' AND
                ${locationFieldSnakeCase}_geom IS NULL;
          `);
        })
    }).flat();
}

function buildPolygonQueries(db: Knex) {
    const modelsWithPolygon =
        strapi.services[locaitonServiceUid].getModelsWithPolygon();

    return modelsWithPolygon.map(model => {
        const tableName = model.tableName;

        return strapi.services[locaitonServiceUid].getPolygonFields(model.attributes)
            .map(async (polygonField) => {
                const polygonFieldSnakeCase = _.snakeCase(polygonField);
                const hasColumn = await db.schema.hasColumn(
                    `${tableName}`,
                    `${polygonFieldSnakeCase}_geom`
                );
                if (!hasColumn) {
                    await db.raw(`
                        ALTER TABLE ${tableName}
                        ADD COLUMN ${polygonFieldSnakeCase}_geom GEOMETRY(Polygon, 4326);
                    `);
                }
                // Generate point column field using only a query
                await db.raw(`
                UPDATE ${tableName}
                SET ${polygonFieldSnakeCase}_geom = ST_SetSRID(
                    ST_MakePolygon(
                        ST_MakeLine(
                            ARRAY(
                                SELECT ST_MakePoint(
                                    CAST((coords->>'lng') AS DOUBLE PRECISION),
                                    CAST((coords->>'lat') AS DOUBLE PRECISION)
                                )
                                FROM jsonb_array_elements(${polygonFieldSnakeCase}) as coords
                            )
                        )
                    ),
                4326)
                WHERE jsonb_array_length(${polygonFieldSnakeCase}) > 0 AND ${polygonFieldSnakeCase}_geom IS NULL;

                `);
            })
    }).flat();
}
