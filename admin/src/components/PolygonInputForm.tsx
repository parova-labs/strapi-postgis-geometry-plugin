import { GridItem, JSONInput } from '@strapi/design-system';
import React from 'react';
import {Point} from "../types";

const PolygonInputForm = ({
  points,
  handleSetLocation,
}: {
  points: Point[]
  handleSetLocation: (newValue: Point[]) => void;
}) => {
  return (
    <>
      <GridItem col={12}>
        <JSONInput
          label="Polygon"
          value={points}
          onChange={(newValue: Point[]) =>
            handleSetLocation(newValue)
          }
        />
      </GridItem>
    </>
  );
};

export default PolygonInputForm;
