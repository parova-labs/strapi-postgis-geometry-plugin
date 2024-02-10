import {GridItem, NumberInput} from "@strapi/design-system";
import React from "react";
import {Point} from "../types";

const LocationInputForm = ({
                               point,
                               handleSetLocation,
                           }: {
    point: Point,
    handleSetLocation: (newValue: Point) => void;
}) => {
    const {lat, lng} = point;
    return (
        <>
            <GridItem col={6}>
                <NumberInput
                    label="Lat"
                    value={lat ? lat : 0}
                    onValueChange={(newValue: number) =>
                        handleSetLocation({lat: newValue, lng})
                    }
                />
            </GridItem>
            <GridItem col={6}>
                <NumberInput
                    label="Lng"
                    value={lng ? lng : 0}
                    onValueChange={(newValue: number) =>
                        handleSetLocation({lat, lng: newValue})
                    }
                />
            </GridItem>
        </>
    );
};

export default LocationInputForm;
