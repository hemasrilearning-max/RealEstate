import React, {
  useEffect,
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

/*
 * =========================================================
 * LEAFLET DEFAULT MARKER ICON
 * =========================================================
 */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/*
 * =========================================================
 * MAP VIEW UPDATER
 * =========================================================
 *
 * MapContainer normally uses its center only during the
 * initial render.
 *
 * This component moves the map whenever the coordinates
 * change after geocoding or manual coordinate editing.
 */

function MapViewUpdater({
  latitude,
  longitude,
}) {
  const map = useMap();

  useEffect(() => {
    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      map.setView(
        [latitude, longitude],
        map.getZoom() < 10
          ? 15
          : map.getZoom()
      );
    }
  }, [
    latitude,
    longitude,
    map,
  ]);

  return null;
}

/*
 * =========================================================
 * PROPERTY MAP
 * =========================================================
 */

function PropertyMap({
  latitude,
  longitude,
  locationName = "Property Location",

  /*
   * When draggable=true, the owner can move the marker.
   */
  draggable = false,

  /*
   * Parent receives the updated coordinates.
   */
  onPositionChange,
}) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return (
      <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
        Location coordinates are not available.
      </div>
    );
  }

  const handleMarkerDragEnd = (
    event
  ) => {
    if (
      !onPositionChange
    ) {
      return;
    }

    const marker =
      event.target;

    const position =
      marker.getLatLng();

    onPositionChange({
      latitude:
        Number(
          position.lat.toFixed(6)
        ),

      longitude:
        Number(
          position.lng.toFixed(6)
        ),
    });
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200">

      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        style={{
          height: "400px",
          width: "100%",
        }}
      >

        <MapViewUpdater
          latitude={lat}
          longitude={lng}
        />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[
            lat,
            lng,
          ]}
          draggable={
            draggable
          }
          eventHandlers={
            draggable
              ? {
                  dragend:
                    handleMarkerDragEnd,
                }
              : undefined
          }
        >

          <Popup>

            <strong>
              {locationName}
            </strong>

            <br />

            Latitude: {lat}

            <br />

            Longitude: {lng}

            {draggable && (
              <>
                <br />
                <br />
                <span>
                  Drag the marker to adjust the property position.
                </span>
              </>
            )}

          </Popup>

        </Marker>

      </MapContainer>

    </div>
  );
}

export default PropertyMap;