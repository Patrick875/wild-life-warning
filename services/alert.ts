import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAlertSubmissions,
  fetchAlerts,
  fetchFormDetails,
  fetchKoboFormStructure,
  fetchMyAlerts,
  fetchMyAlertSubmissions,
  submitObservation,
} from "./api";
import { apiClient } from "./axiosInstance";

export const useGetAlerts = ({ formId }: { formId: string }) => {
  return useQuery({
    queryKey: ["alerts", formId],
    queryFn: () => fetchAlerts(formId),
    staleTime: 0,
    enabled: !!formId,
    refetchOnWindowFocus: true,
  });
};

export const useGetAlertSubmissions = ({ formId }: { formId: string }) => {
  return useQuery({
    queryKey: ["alert-submissions", formId],
    queryFn: () => fetchAlertSubmissions(formId),
    staleTime: 0,
    enabled: !!formId,
  });
};

export const useGetMyAlerts = ({ formId }: { formId: string }) => {
  return useQuery({
    queryKey: ["my-alerts", formId],
    queryFn: () => fetchMyAlerts(formId),
    staleTime: 0,
    enabled: !!formId,
    refetchOnWindowFocus: true,
  });
};

export const useGetMyAlertSubmissions = ({ formId }: { formId: string }) => {
  return useQuery({
    queryKey: ["my-alert-submissions", formId],
    queryFn: () => fetchMyAlertSubmissions(formId),
    staleTime: 0,
    enabled: !!formId,
  });
};

export const useGetFormDetails = ({ formId }: { formId: string }) => {
  return useQuery({
    queryKey: ["koboForm-details", formId],
    queryFn: () => fetchFormDetails(formId),
    staleTime: 0,
    enabled: !!formId,
  });
};

export const useGetFormStructure = ({ formId }: { formId: string }) => {
  return useQuery({
    queryKey: ["koboForm", formId],
    queryFn: () => fetchKoboFormStructure(formId),
    enabled: !!formId,
  });
};

export const useGetFeedbacks = ({ alertId }: { alertId: number | null }) => {
  return useQuery({
    queryKey: ["alert-feedbacks", alertId],
    queryFn: async () => {
      return await apiClient
        .get(`/warnings/feedbacks/${alertId}`)
        .then((res) => res.data);
    },
    staleTime: 0,
    enabled: !!alertId,
  });
};

export const useSubmitObservation = ({ formId }: { formId: string }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (observation: unknown) =>
      submitObservation({ formId, observation }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts", formId] });
      queryClient.invalidateQueries({ queryKey: ["my-alerts", formId] });
      queryClient.invalidateQueries({
        queryKey: ["alert-submissions", formId],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-alert-submissions", formId],
      });
    },
  });
};

export const useSubmitFeedback = () => {
  return useMutation({
    mutationFn: async (data: { message: string; warning_id?: string | number }) => {
      return await apiClient
        .post(`/warnings/feedbacks`, data)
        ?.then((res) => res?.data);
    },
  });
};
