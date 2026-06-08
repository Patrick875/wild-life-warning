import { KM_TO_MILES } from "@/utils/constants";
import { getDistance } from "geolib";
import { useMemo } from "react";

interface loc {
  longitude: number | string | undefined;
  latitude: number | string | undefined;
}
interface Props {
  locationFrom: loc;
  locationTo: loc;
  unit?: "km" | "miles" | "meters";
}

export const useLocationDistance = ({
  locationFrom,
  locationTo,
  unit = "km",
}: Props) => {
  // const [distance,setDistance]=useState(0)
  const distance = useMemo(() => {
    if (
      locationFrom.latitude == null ||
      locationFrom.longitude == null ||
      locationTo.latitude == null ||
      locationTo.longitude == null
    ) {
      return 0;
    }
    const calculated_dist = getDistance(
      {
        latitude: locationFrom.latitude,
        longitude: locationFrom.longitude,
      },
      { latitude: locationTo.latitude, longitude: locationTo.longitude },
    );
    if (unit == "km") {
      return calculated_dist / 1000;
    } else if (unit == "meters") {
      return calculated_dist;
    } else {
      return calculated_dist * KM_TO_MILES;
    }
  }, [
    locationFrom.latitude,
    locationFrom.longitude,
    locationTo.latitude,
    locationTo.longitude,
    unit,
  ]);

  return { distance: distance, unit };
};
