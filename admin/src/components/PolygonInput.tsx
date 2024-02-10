/**
 *
 * LocationInput
 *
 */

import {
    Box,
    Button,
    Grid,
    GridItem,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalLayout,
    Typography,
} from "@strapi/design-system";
import "leaflet/dist/leaflet.css";
import React, {useRef, useState} from "react";
//@ts-ignore
import _ from "lodash";
import {Point} from "../types";
import PolygonInputForm from "./PolygonInputForm";

//@ts-ignore
const PolygonInput = ({ value, onChange, name, attribute }) => {
    const defaultPoints = JSON.stringify([
        {lat: 44.445869, lng: 26.096461},
        {lat: 44.446080, lng: 26.097150},
        {lat: 44.446016, lng: 26.097235},
        {lat: 44.446231, lng: 26.097654},
        {lat: 44.446399, lng: 26.097502},
        {lat: 44.446276, lng: 26.097166},
        {lat: 44.446328, lng: 26.097111},
        {lat: 44.446279, lng: 26.096992},
        {lat: 44.446310, lng: 26.096968},
        {lat: 44.446269, lng: 26.096876},
        {lat: 44.446375, lng: 26.096769},
        {lat: 44.446343, lng: 26.096726},
        {lat: 44.445869, lng: 26.096461}
    ]); // Cartierul Armenesc

    const [points, setLocation] = useState(value);

    const handleSetLocation = (newValue: Point[]) => {
        setLocation(newValue);

        onChange({
            target: {
                name,
                value: newValue,
                type: attribute.type,
            },
        });
    };

    return (
        <Box>
            <Typography fontWeight="bold" variant="pi">
                {name}
            </Typography>
            <Grid gap={5}>
                <PolygonInputForm
                    points={points !== 'null' ? points : defaultPoints}
                    handleSetLocation={handleSetLocation}
                />
            </Grid>
        </Box>
    );
};

export default PolygonInput;
