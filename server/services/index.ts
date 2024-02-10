import { Strapi } from '@strapi/strapi';

const locationServices = ({ strapi }: { strapi: Strapi }) => ({
  getLocationFields: (modelAttributes: any) => {
    return Object.entries(modelAttributes)
      .map(([key, value]) => {
        if (
          value &&
          typeof value === 'object' &&
          'customField' in value &&
          value.customField === 'plugin::strapi-postgis-geometry-plugin.location'
        ) {
          return key;
        } else {
          return false;
        }
      })
      .filter(Boolean);
  },
  getPolygonFields: (modelAttributes: any) => {
    return Object.entries(modelAttributes)
      .map(([key, value]) => {
        if (
          value &&
          typeof value === 'object' &&
          'customField' in value &&
          value.customField === 'plugin::strapi-postgis-geometry-plugin.polygon'
        ) {
          return key;
        } else {
          return false;
        }
      })
      .filter(Boolean);
  },
  getModelsWithLocation: () => {
    return strapi.db.config.models
      .filter(
        (model) =>
          (model.uid as string).startsWith('api::') ||
          //@ts-ignore
          model.modelType === 'component' ||
          (model.uid as string) === 'plugin::users-permissions.user'
      )
      .map((model) => {
        const hasLocationField = Object.values(model.attributes).some(
          (entry) => {
            if (
              entry &&
              typeof entry === 'object' &&
              'customField' in entry &&
              entry.customField === 'plugin::strapi-postgis-geometry-plugin.location'
            ) {
              return true;
            } else {
              return false;
            }
          }
        );
        return hasLocationField ? model : false;
      })
      .filter(Boolean);
  },
  getModelsWithPolygon: () => {
    return strapi.db.config.models
      .filter(
        (model) =>
          (model.uid as string).startsWith('api::') ||
          //@ts-ignore
          model.modelType === 'component' ||
          (model.uid as string) === 'plugin::users-permissions.user'
      )
      .map((model) => {
        const hasLocationField = Object.values(model.attributes).some(
          (entry) => {
            if (
              entry &&
              typeof entry === 'object' &&
              'customField' in entry &&
              entry.customField === 'plugin::strapi-postgis-geometry-plugin.polygon'
            ) {
              return true;
            } else {
              return false;
            }
          }
        );
        return hasLocationField ? model : false;
      })
      .filter(Boolean);
  },
});
export default {
  locationServices,
};
