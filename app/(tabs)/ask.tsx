import {
  chatQueryKeys,
  ChatMessage,
  useGetConversationMessages,
  useGetConversations,
  useSendChat,
} from "@/services/chat";
import { getSafeErrorMessage } from "@/services/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";
import {
  MessageCircleQuestion,
  Plus,
  RefreshCw,
  SendHorizontal,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const EmptyConversationsTop = () => {
  return (
    <View style={styles.emptyState}>
      <MessageCircleQuestion size={42} color="#2F5D3A" />
      <Text style={styles.emptyTitle}>Wildlife Assistant</Text>
      <Text style={styles.emptyText}>
        Ask about animal signs, dangerous behavior, park safety, or wildlife
        warnings.
      </Text>
    </View>
  );
};

const formatMessageTime = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.userMessageRow : styles.assistantMessageRow,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {message.content}
        </Text>
        <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
          {formatMessageTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
};

const Ask = () => {
  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);
  const [hasSelectedInitialConversation, setHasSelectedInitialConversation] =
    useState(false);

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    isRefetching: conversationsRefreshing,
    refetch: refetchConversations,
  } = useGetConversations();

  const {
    data: messages = [],
    isLoading: messagesLoading,
    isRefetching: messagesRefreshing,
    refetch: refetchMessages,
  } = useGetConversationMessages({ conversationId: activeConversationId });

  const sendChat = useSendChat();

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at).getTime() -
          new Date(a.updated_at || a.created_at).getTime(),
      ),
    [conversations],
  );

  useEffect(() => {
    if (!hasSelectedInitialConversation && sortedConversations.length > 0) {
      setActiveConversationId(sortedConversations[0].id);
      setHasSelectedInitialConversation(true);
    }
  }, [hasSelectedInitialConversation, sortedConversations]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, sendChat.isPending]);

  const refreshChat = () => {
    refetchConversations();
    if (activeConversationId) {
      refetchMessages();
    }
  };

  const startNewConversation = () => {
    setHasSelectedInitialConversation(true);
    setActiveConversationId(null);
    setMessage("");
    Toast.show({
      type: "info",
      text1: "New chat ready",
      text2: "Send a message to start a conversation.",
    });
  };

  const handleSend = () => {
    const content = message.trim();

    if (!content || sendChat.isPending) {
      return;
    }

    setMessage("");

    sendChat.mutate(
      {
        content,
        ...(activeConversationId
          ? { conversation_id: activeConversationId }
          : {}),
      },
      {
        onSuccess: (data) => {
          const conversationId = data.conversation.id;

          setActiveConversationId(conversationId);
          queryClient.setQueryData<ChatMessage[]>(
            chatQueryKeys.messages(conversationId),
            (current = []) => [
              ...current,
              data.user_message,
              data.assistant_message,
            ],
          );
          queryClient.invalidateQueries({
            queryKey: chatQueryKeys.conversations,
          });

          Toast.show({
            type: "success",
            text1: "Reply received",
            text2: data.conversation.title || "Conversation updated",
          });
        },
        onError: (error) => {
          setMessage(content);
          Toast.show({
            type: "error",
            text1: "Message not sent",
            text2: getSafeErrorMessage(error, "Please try again."),
          });
        },
      },
    );
  };

  const isRefreshing = conversationsRefreshing || messagesRefreshing;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerText}>Ask Wildlife AI</Text>
            <Text style={styles.headerSubText}>
              Animal signs, safety and park guidance
            </Text>
          </View>

          <TouchableOpacity
            style={styles.newChatButton}
            accessibilityLabel="Start new chat"
            onPress={startNewConversation}
          >
            <Plus color="#2F5D3A" size={21} />
          </TouchableOpacity>
        </View>

        {conversationsLoading ? (
          <View style={styles.conversationsLoading}>
            <ActivityIndicator color="#2F5D3A" />
          </View>
        ) : sortedConversations.length > 0 ? (
          <View style={styles.conversationRailWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.conversationRail}
            >
              {sortedConversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;

                return (
                  <TouchableOpacity
                    key={conversation.id}
                    style={[
                      styles.conversationChip,
                      isActive && styles.conversationChipActive,
                    ]}
                    onPress={() => setActiveConversationId(conversation.id)}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.conversationChipText,
                        isActive && styles.conversationChipTextActive,
                      ]}
                    >
                      {conversation.title || "New conversation"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        <ScrollView
          ref={scrollRef}
          style={styles.messagesCont}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refreshChat} />
          }
        >
          {messagesLoading ? (
            <View style={styles.loadingMessages}>
              <ActivityIndicator color="#2F5D3A" />
              <Text style={styles.loadingText}>Loading conversation...</Text>
            </View>
          ) : messages.length === 0 ? (
            <EmptyConversationsTop />
          ) : (
            <View style={styles.messageList}>
              {messages.map((item) => (
                <ChatBubble key={item.id} message={item} />
              ))}
            </View>
          )}

          {sendChat.isPending && (
            <View style={styles.typingRow}>
              <ActivityIndicator color="#2F5D3A" size="small" />
              <Text style={styles.typingText}>AI is thinking...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.messageBoxWrapper}>
          <View
            style={styles.messageBoxCont}
          >
            <TextInput
              style={styles.messageInput}
              placeholder="Ask about wild animal safety..."
              placeholderTextColor="#7A8A7A"
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
              onFocus={() =>
                requestAnimationFrame(() => {
                  scrollRef.current?.scrollToEnd({ animated: false });
                })
              }
            />

            <TouchableOpacity
              style={[
                styles.messageBtn,
                !message.trim() && styles.messageBtnDisabled,
              ]}
              accessibilityLabel="Send chat"
              disabled={!message.trim() || sendChat.isPending}
              onPress={handleSend}
            >
              {sendChat.isPending ? (
                <RefreshCw color="#fff" size={20} />
              ) : (
                <SendHorizontal color="#fff" size={22} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7F2",
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: "#EAF4E4",
    borderBottomWidth: 1,
    borderBottomColor: "#D7E8CE",
  },

  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#183D20",
  },

  headerSubText: {
    marginTop: 4,
    fontSize: 13,
    color: "#5E725E",
  },

  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E8CE",
  },

  conversationsLoading: {
    minHeight: 48,
    justifyContent: "center",
    backgroundColor: "#F6F7F2",
  },

  conversationRailWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "#E1E6DC",
    backgroundColor: "#F6F7F2",
  },

  conversationRail: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  conversationChip: {
    maxWidth: 190,
    minHeight: 36,
    justifyContent: "center",
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE8D5",
  },

  conversationChipActive: {
    backgroundColor: "#2F5D3A",
    borderColor: "#2F5D3A",
  },

  conversationChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#496149",
  },

  conversationChipTextActive: {
    color: "#FFFFFF",
  },

  messagesCont: {
    flex: 1,
  },

  messagesContent: {
    flexGrow: 1,
    padding: 20,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "700",
    color: "#183D20",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#607060",
    textAlign: "center",
  },

  loadingMessages: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#607060",
  },

  messageList: {
    gap: 12,
  },

  messageRow: {
    flexDirection: "row",
  },

  userMessageRow: {
    justifyContent: "flex-end",
  },

  assistantMessageRow: {
    justifyContent: "flex-start",
  },

  messageBubble: {
    maxWidth: "86%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  userBubble: {
    backgroundColor: "#2F5D3A",
    borderBottomRightRadius: 5,
  },

  assistantBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: "#DDE8D5",
  },

  messageText: {
    fontSize: 15,
    lineHeight: 21,
    color: "#1F2A1F",
  },

  userMessageText: {
    color: "#FFFFFF",
  },

  messageTime: {
    alignSelf: "flex-end",
    marginTop: 6,
    fontSize: 11,
    color: "#718171",
  },

  userMessageTime: {
    color: "#DDE8D5",
  },

  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    alignSelf: "flex-start",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#EAF4E4",
  },

  typingText: {
    fontSize: 13,
    color: "#496149",
  },

  messageBoxWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: "#F6F7F2",
    borderTopWidth: 1,
    borderTopColor: "#E1E6DC",
  },

  messageBoxCont: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 8,
    borderWidth: 1,
    borderColor: "#DDE8D5",
  },

  messageInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2A1F",
  },

  messageBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2F5D3A",
    alignItems: "center",
    justifyContent: "center",
  },

  messageBtnDisabled: {
    backgroundColor: "#A7B8A3",
  },
});

export default Ask;
