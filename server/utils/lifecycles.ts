import { Strapi } from '@strapi/strapi';
import { Event } from '@strapi/database/dist/lifecycles';
import { Subscriber } from '@strapi/database/dist/lifecycles/types';
import _ from 'lodash';

const locaitonServiceUid = 'plugin::location-plugin.locationServices';

const createLocationSubscriber = (strapi: Strapi): Subscriber => {
  const db = strapi.db.connection;
  const modelsWithLocation =
    strapi.services[locaitonServiceUid].getModelsWithLocation();

  return {
    // @ts-expect-error
    model: modelsWithLocation.map((model) => model.uid),
    afterCreate: async (event: Event) => {
      const { model } = event;
      const locationFields = strapi.services[
        locaitonServiceUid
      ].getLocationFields(model.attributes);
      // @ts-expect-error
      const id = event?.result?.id;
      if (!id) return;

      await Promise.all(
        locationFields.map(async (locationField) => {
          const data = event.params.data[locationField];

          if (!data?.lng || !data?.lat) return;

          await db.raw(`
              UPDATE ${model.tableName}
              SET ${_.snakeCase(
                locationField
              )}_geom = ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326)
              WHERE id = ${id};
          `);
        })
      );
    },
    afterUpdate: async (event: Event) => {
      const { model, params } = event;
      const locationFields = strapi.services[locaitonServiceUid].getLocationFields(model.attributes);

      await Promise.all(
        locationFields.map(async (locationField) => {
          const data = params.data[locationField];
          if (!params.where.id || !data?.lng || !data?.lat) return;

          await db.raw(`
            UPDATE ${model.tableName}
            SET ${_.snakeCase(locationField)}_geom = ST_SetSRID(ST_MakePoint(${
            data.lng
          }, ${data.lat}), 4326)
            WHERE id = ${params.where.id};
          `);
        })
      );
    },
  };
};

const createPolygonSubscriber = (strapi: Strapi): Subscriber => {
  const db = strapi.db.connection;
  const modelsWithPolygon =
    strapi.services[locaitonServiceUid].getModelsWithPolygon();

  return {
    // @ts-expect-error
    model: modelsWithPolygon.map((model) => model.uid),
    afterCreate: async (event: Event) => {
      const { model } = event;
      const polygonFields = strapi.services[
        locaitonServiceUid
      ].getPolygonFields(model.attributes);
      // @ts-expect-error
      const id = event?.result?.id;
      if (!id) return;

      await Promise.all(
        polygonFields.map(async (polygonField) => {
          const data = event.params.data[polygonField];

          if (!data.length || !data.every(coord => coord.lat !== null && coord.lng !== null)) return;
            const polygonFieldSnakeCase = _.snakeCase(polygonField);
          await db.raw(`
              UPDATE ${model.tableName}
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
              WHERE id = ${id};
          `);
        })
      );
    },
    afterUpdate: async (event: Event) => {
      const { model, params } = event;
      const polygonFields = strapi.services[locaitonServiceUid].getPolygonFields(model.attributes);

      await Promise.all(
        polygonFields.map(async (polygonField) => {
          const data = params.data[polygonField];
          if (
              !params.where.id
              || !data.length
              || !data.every(coord => coord.lat !== null && coord.lng !== null)
          ) return;

          const polygonFieldSnakeCase = _.snakeCase(polygonField);
          await db.raw(`
            UPDATE ${model.tableName}
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
            WHERE id = ${params.where.id};
          `);
        })
      );
    },
  };
};

export { createLocationSubscriber, createPolygonSubscriber };
