import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./axiosInstance";

export type ChatRole = "user" | "assistant" | string;

export type Conversation = {
  id: number;
  title: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: number;
  conversation_id: number;
  content: string;
  model: string | null;
  tokens_used: number;
  role: ChatRole;
  topic: string | null;
  created_at: string;
  updated_at: string;
};

export type SendChatResponse = {
  conversation: Conversation;
  user_message: ChatMessage;
  assistant_message: ChatMessage;
  tokens: {
    prompt_tokens: number;
    response_tokens: number;
    total_tokens_used: number;
  };
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const chatQueryKeys = {
  conversations: ["chatbox", "conversations"] as const,
  messages: (conversationId?: number | null) =>
    ["chatbox", "messages", conversationId] as const,
};

export const useGetConversations = () => {
  return useQuery({
    queryKey: chatQueryKeys.conversations,
    queryFn: async () => {
      const response =
        await apiClient.get<ApiResponse<Conversation[]>>("/ai/conversations");
      return response.data.data ?? [];
    },
    staleTime: 0,
  });
};

export const useGetConversationMessages = ({
  conversationId,
}: {
  conversationId?: number | null;
}) => {
  return useQuery({
    queryKey: chatQueryKeys.messages(conversationId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ChatMessage[]>>(
        `/ai/conversations/${conversationId}/messages`,
      );
      return response.data.data ?? [];
    },
    enabled: !!conversationId,
    staleTime: 0,
  });
};

export const useSendChat = () => {
  return useMutation({
    mutationFn: async (data: { content: string; conversation_id?: number }) => {
      const response = await apiClient.post<ApiResponse<SendChatResponse>>(
        "/ai/chat",
        data,
      );
      return response.data.data;
    },
  });
};
