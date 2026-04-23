"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Phone,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  actions?: ChatAction[];
}

interface ChatAction {
  label: string;
  type: "enroll" | "callback" | "link" | "quick_reply";
  payload?: string;
}

interface FlowData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  name?: string;
  reason?: string;
}

type ActiveFlow =
  | null
  | { type: "enroll"; step: "name" | "email" | "phone" | "confirm"; data: FlowData }
  | { type: "callback"; step: "name" | "phone" | "reason" | "confirm"; data: FlowData };

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hei! 👋 Jeg er KKS-assistenten. Jeg kan hjelpe deg med å finne riktig kurs, sjekke ledige datoer og priser, eller melde deg på direkte. Hva kan jeg hjelpe deg med?",
  actions: [
    { label: "Vis ledige kurs", type: "quick_reply", payload: "Hvilke kurs har dere ledige nå?" },
    { label: "Truckkurs", type: "quick_reply", payload: "Jeg er interessert i truckkurs" },
    { label: "HMS-kurs", type: "quick_reply", payload: "Fortell meg om HMS-kurs" },
    { label: "Ring meg opp", type: "callback" },
  ],
};

const STORAGE_KEY = "kks-chat";

function loadStoredMessages(): ChatMessage[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChatMessage[];
    return parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function storeMessages(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch { /* storage full — ignore */ }
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredMessages() ?? [WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    storeMessages(messages);
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  function addAssistantMessage(content: string, actions?: ChatAction[]) {
    setMessages((prev) => [...prev, { role: "assistant", content, actions }]);
  }

  function addUserMessage(content: string) {
    setMessages((prev) => [...prev, { role: "user", content }]);
  }

  function startEnrollFlow() {
    setActiveFlow({ type: "enroll", step: "name", data: {} });
    addAssistantMessage("Flott! Da melder vi deg på 🎉\n\nHva er ditt **fulle navn**? (Fornavn og etternavn)");
  }

  function startCallbackFlow() {
    setActiveFlow({ type: "callback", step: "name", data: {} });
    addAssistantMessage("Selvfølgelig! Vi ringer deg så raskt vi kan.\n\nHva heter du?");
  }

  async function handleFlowInput(text: string) {
    if (!activeFlow) return;
    addUserMessage(text);

    if (activeFlow.type === "enroll") {
      await handleEnrollStep(text);
    } else if (activeFlow.type === "callback") {
      await handleCallbackStep(text);
    }
  }

  async function handleEnrollStep(text: string) {
    if (activeFlow?.type !== "enroll") return;
    const { step, data } = activeFlow;

    if (step === "name") {
      const parts = text.trim().split(/\s+/);
      if (parts.length < 2) {
        addAssistantMessage("Jeg trenger både fornavn og etternavn. Prøv igjen:");
        return;
      }
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ");
      setActiveFlow({ type: "enroll", step: "email", data: { ...data, firstName, lastName } });
      addAssistantMessage(`Takk, ${firstName}! Hva er **e-postadressen** din?`);
    } else if (step === "email") {
      if (!text.includes("@") || !text.includes(".")) {
        addAssistantMessage("Det ser ikke ut som en gyldig e-postadresse. Prøv igjen:");
        return;
      }
      setActiveFlow({ type: "enroll", step: "phone", data: { ...data, email: text.trim() } });
      addAssistantMessage("Perfekt! Og **telefonnummeret** ditt?");
    } else if (step === "phone") {
      const digits = text.replace(/\D/g, "");
      if (digits.length < 8) {
        addAssistantMessage("Telefonnummeret må ha minst 8 siffer. Prøv igjen:");
        return;
      }
      const newData = { ...data, phone: text.trim() };
      setActiveFlow({ type: "enroll", step: "confirm", data: newData });
      addAssistantMessage(
        `Fint! Sjekk at dette stemmer:\n\n**Navn:** ${newData.firstName} ${newData.lastName}\n**E-post:** ${newData.email}\n**Telefon:** ${newData.phone}\n\nStemmer dette?`,
        [
          { label: "Ja, meld meg på!", type: "quick_reply", payload: "__confirm_enroll__" },
          { label: "Nei, start på nytt", type: "quick_reply", payload: "__cancel_flow__" },
        ]
      );
    }
  }

  async function handleCallbackStep(text: string) {
    if (activeFlow?.type !== "callback") return;
    const { step, data } = activeFlow;

    if (step === "name") {
      setActiveFlow({ type: "callback", step: "phone", data: { ...data, name: text.trim() } });
      addAssistantMessage(`Hei, ${text.trim()}! Hva er **telefonnummeret** vi skal ringe deg på?`);
    } else if (step === "phone") {
      const digits = text.replace(/\D/g, "");
      if (digits.length < 8) {
        addAssistantMessage("Telefonnummeret må ha minst 8 siffer. Prøv igjen:");
        return;
      }
      setActiveFlow({ type: "callback", step: "reason", data: { ...data, phone: text.trim() } });
      addAssistantMessage(
        "Hva gjelder henvendelsen? (Kort beskrivelse, f.eks. «truckkurs for 5 ansatte» eller «haster med HMS-kurs»)",
      );
    } else if (step === "reason") {
      const newData = { ...data, reason: text.trim() };
      setActiveFlow({ type: "callback", step: "confirm", data: newData });
      addAssistantMessage(
        `Da noterer jeg:\n\n**Navn:** ${newData.name}\n**Telefon:** ${newData.phone}\n**Gjelder:** ${newData.reason}\n\nSkal jeg sende dette til oss?`,
        [
          { label: "Ja, ring meg!", type: "quick_reply", payload: "__confirm_callback__" },
          { label: "Avbryt", type: "quick_reply", payload: "__cancel_flow__" },
        ]
      );
    }
  }

  async function submitEnrollment() {
    if (activeFlow?.type !== "enroll") return;
    const { data } = activeFlow;
    setIsLoading(true);

    try {
      const res = await fetch("/api/public/chat/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setActiveFlow(null);
        addAssistantMessage(
          `Du er nå påmeldt! 🎉\n\nDu mottar en bekreftelse på **${data.email}** med all praktisk informasjon.\n\nHar du flere spørsmål?`,
          [
            { label: "Se flere kurs", type: "quick_reply", payload: "Vis andre ledige kurs" },
            { label: "HMS Nova / BHT", type: "quick_reply", payload: "Fortell om HMS Nova og BHT-medlemskap" },
          ]
        );
      } else {
        setActiveFlow(null);
        addAssistantMessage(
          `${result.error || "Noe gikk galt med påmeldingen."}\n\nDu kan også melde deg på direkte på nettsiden, eller ring oss på **+47 91 54 08 24** så hjelper vi deg.`
        );
      }
    } catch {
      setActiveFlow(null);
      addAssistantMessage(
        "Beklager, det oppstod en feil. Ring oss på **+47 91 54 08 24** eller meld deg på via nettsiden."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function submitCallback() {
    if (activeFlow?.type !== "callback") return;
    const { data } = activeFlow;
    setIsLoading(true);

    try {
      const res = await fetch("/api/public/chat/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setActiveFlow(null);
        addAssistantMessage(
          "Mottatt! ✅ En av våre rådgivere ringer deg så snart som mulig.\n\nEr det noe annet jeg kan hjelpe med i mellomtiden?"
        );
      } else {
        setActiveFlow(null);
        addAssistantMessage(
          `Beklager, noe gikk galt. Ring oss direkte på **+47 91 54 08 24** (kurs) — vi er tilgjengelige Man–Fre 08:00–16:00.`
        );
      }
    } catch {
      setActiveFlow(null);
      addAssistantMessage(
        "Beklager, det oppstod en feil. Du kan ringe oss direkte på **+47 91 54 08 24**."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleActionClick(action: ChatAction) {
    if (action.type === "callback") {
      addUserMessage("Jeg vil at noen ringer meg");
      startCallbackFlow();
    } else if (action.type === "enroll") {
      addUserMessage("Ja, meld meg på!");
      startEnrollFlow();
    } else if (action.type === "link" && action.payload) {
      window.open(action.payload, "_blank");
    } else if (action.type === "quick_reply" && action.payload) {
      if (action.payload === "__confirm_enroll__") {
        addUserMessage("Ja, meld meg på!");
        submitEnrollment();
        return;
      }
      if (action.payload === "__confirm_callback__") {
        addUserMessage("Ja, ring meg!");
        submitCallback();
        return;
      }
      if (action.payload === "__cancel_flow__") {
        addUserMessage("Avbryt");
        setActiveFlow(null);
        addAssistantMessage("Ingen problem! Hva annet kan jeg hjelpe med?");
        return;
      }
      handleChatMessage(action.payload);
    }
  }

  async function handleChatMessage(text: string) {
    addUserMessage(text);
    setIsLoading(true);

    try {
      const apiMessages = [...messages.filter((m) => m !== WELCOME_MESSAGE), { role: "user" as const, content: text }]
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (res.ok) {
        const reply = data.reply || "Beklager, noe gikk galt.";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply, actions: data.actions },
        ]);
      } else {
        addAssistantMessage(
          "Beklager, jeg klarte ikke å svare akkurat nå. Ring oss på **+47 91 54 08 24**."
        );
      }
    } catch {
      addAssistantMessage(
        "Beklager, noe gikk galt. Kontakt oss direkte på **post@kksas.no** eller **+47 91 54 08 24**."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");

    if (activeFlow) {
      handleFlowInput(trimmed);
    } else {
      handleChatMessage(trimmed);
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[60] w-[400px] max-w-[calc(100vw-2rem)] rounded-2xl border bg-background shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeFlow && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={() => {
                    setActiveFlow(null);
                    addAssistantMessage("Avbrutt. Hva annet kan jeg hjelpe med?");
                  }}
                  aria-label="Tilbake"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">KKS-assistenten</p>
                <p className="text-xs text-blue-100">
                  {activeFlow?.type === "enroll"
                    ? "Påmelding"
                    : activeFlow?.type === "callback"
                      ? "Ring meg-forespørsel"
                      : "Kurs, priser og påmelding"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-8 w-8"
              onClick={() => setIsOpen(false)}
              aria-label="Lukk chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[420px] min-h-[300px]">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    <MessageContent content={msg.content} />
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
                {msg.actions && msg.actions.length > 0 && (
                  <div className="ml-9 mt-2 flex flex-wrap gap-2">
                    {msg.actions.map((action, j) => (
                      <Button
                        key={j}
                        variant={action.type === "callback" ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "rounded-full text-xs h-8",
                          action.type === "enroll" && "border-green-500 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950",
                          action.type === "callback" && "bg-orange-500 hover:bg-orange-600 text-white"
                        )}
                        onClick={() => handleActionClick(action)}
                        disabled={isLoading}
                      >
                        {action.type === "callback" && <Phone className="h-3 w-3 mr-1" />}
                        {action.type === "enroll" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2 bg-background">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeFlow?.type === "enroll"
                  ? activeFlow.step === "name" ? "Fornavn Etternavn" : activeFlow.step === "email" ? "din@epost.no" : activeFlow.step === "phone" ? "+47 XXX XX XXX" : "Skriv en melding..."
                  : activeFlow?.type === "callback"
                    ? activeFlow.step === "name" ? "Ditt navn" : activeFlow.step === "phone" ? "+47 XXX XX XXX" : activeFlow.step === "reason" ? "Hva gjelder det?" : "Skriv en melding..."
                    : "Skriv en melding..."
              }
              disabled={isLoading}
              className="flex-1 rounded-full"
              maxLength={500}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="rounded-full shrink-0"
              aria-label="Send melding"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        size="icon"
        className={cn(
          "fixed bottom-4 right-4 z-[60] h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all",
          isOpen
            ? "bg-muted text-muted-foreground hover:bg-muted/80"
            : "bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800"
        )}
        aria-label={isOpen ? "Lukk chat" : "Åpne chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </>
  );
}

function MessageContent({ content }: { content: string }) {
  const tokens = content.split(
    /(\*\*[^*]+\*\*|\[([^\]]+)\]\((https?:\/\/[^)]+)\)|https?:\/\/[^\s)]+|\n|- )/g
  );

  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (!token) {
      i++;
      continue;
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      elements.push(<strong key={i}>{token.slice(2, -2)}</strong>);
      i++;
    } else if (token.startsWith("[") && token.includes("](")) {
      const label = tokens[i + 1];
      const url = tokens[i + 2];
      elements.push(
        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
          {label}
        </a>
      );
      i += 3;
    } else if (/^https?:\/\//.test(token)) {
      const displayUrl = token.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
      const href = token.startsWith("http") ? token : `https://${token}`;
      elements.push(
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
          {displayUrl}
        </a>
      );
      i++;
    } else if (token === "\n") {
      elements.push(<br key={i} />);
      i++;
    } else if (token === "- ") {
      elements.push(<span key={i}>• </span>);
      i++;
    } else {
      const wwwParts = token.split(/(www\.[^\s,)]+)/g);
      for (let j = 0; j < wwwParts.length; j++) {
        const part = wwwParts[j];
        if (part && /^www\.[^\s]+/.test(part)) {
          elements.push(
            <a key={`${i}-${j}`} href={`https://${part}`} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
              {part}
            </a>
          );
        } else if (part) {
          elements.push(<span key={`${i}-${j}`}>{part}</span>);
        }
      }
      i++;
    }
  }

  return <span>{elements}</span>;
}
