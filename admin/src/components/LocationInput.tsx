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
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useMemo, useRef, useState } from "react";
//@ts-ignore
import markerIcon from "leaflet/dist/images/marker-icon.png";
//@ts-ignore
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
//@ts-ignore
import _ from "lodash";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import LocationInputForm from "./LocationInputForm";
import {Point} from "../types";

//@ts-ignore
const icon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
});

const parseValue = (value: string): Point => {
  try {
    const object = JSON.parse(value);

    if (!object?.lat || !object?.lng) {
      return {lat: null, lng: null};
    }


    return _.pick(object, ['lat', 'lng']);

  } catch (error) {
    return {lat: null, lng: null};
  }
};

//@ts-ignore
const LocationInput = ({ value, onChange, name, attribute }) => {
  const [defLat, defLng] = [44.4268, 26.1025];
  const [point, setLocation] = useState(parseValue(value));
  const [isModalVisible, setIsModalVisible] = useState(false);

  const markerRef = useRef(null);

  const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current;
          if (marker != null) {
            handleSetLocation(_.pick((marker as any).getLatLng(), ['lat', 'lng']));
          }
        },
      }),
      []
  );

  const handleSetLocation = (newValue: Point) => {
    setLocation(newValue);

    onChange({
      target: {
        name,
        value: JSON.stringify(newValue),
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
          <LocationInputForm
              point={point}
              handleSetLocation={handleSetLocation}
          />
          <GridItem col={12}>
            <Button onClick={() => setIsModalVisible((prev) => !prev)}>
              Open map
            </Button>
            {isModalVisible && (
                <ModalLayout
                    onClose={() => setIsModalVisible((prev) => !prev)}
                    labelledBy="title"
                >
                  <ModalHeader>
                    <Typography
                        fontWeight="bold"
                        textColor="neutral800"
                        as="h2"
                        id="title"
                    >
                      Title
                    </Typography>
                  </ModalHeader>
                  <ModalBody>
                    <Grid gap={5} className="pb-2">
                      <LocationInputForm
                          point={point}
                          handleSetLocation={handleSetLocation}
                      />
                    </Grid>
                    <Box paddingTop={6}>
                      <MapContainer
                          center={[point.lat ? point.lat : defLat, point.lng ? point.lng : defLng]}
                          zoom={12}
                          scrollWheelZoom={false}
                          style={{ height: "300px" }}
                      >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker
                            draggable
                            eventHandlers={eventHandlers}
                            ref={markerRef}
                            position={[point.lat ? point.lat : defLat, point.lng ? point.lng : defLng]}
                            icon={icon}
                        ></Marker>
                      </MapContainer>
                    </Box>
                  </ModalBody>
                  <ModalFooter
                      endActions={
                        <>
                          <Button onClick={() => setIsModalVisible((prev) => !prev)}>
                            Ok
                          </Button>
                        </>
                      }
                  />
                </ModalLayout>
            )}
          </GridItem>
        </Grid>
      </Box>
  );
};

export default LocationInput;
