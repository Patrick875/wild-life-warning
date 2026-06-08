import { WildlifeAlert } from "@/types/wildlife";

let selectedAlert: WildlifeAlert | null = null;

export const setSelectedAlert = (alert: WildlifeAlert) => {
  selectedAlert = alert;
};

export const getSelectedAlert = () => selectedAlert;
