"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface Route {
  start: string;
  end: string;
  wheelchair?: boolean;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface NavigationVoiceContextType {
  activeRoute: Route | null;
  setActiveRoute: (route: Route | null) => void;
  voiceStatus: 'idle' | 'listening' | 'speaking';
  transcript: string;
  messages: ChatMessage[];
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  sendVoiceCommand: (text: string) => void;
  isSpeechSupported: boolean;
}

const NavigationVoiceContext = createContext<NavigationVoiceContextType | undefined>(undefined);

export const NavigationVoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRoute, setActiveRouteState] = useState<Route | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "System Voice Assistant initialized. Try saying: 'Navigate from Gate A to Sector 102' or use the command field below.",
      timestamp: new Date()
    }
  ]);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  // Set active route wrapper to trigger TTS
  const setActiveRoute = (route: Route | null) => {
    setActiveRouteState(route);
  };

  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setVoiceStatus('listening');
        setTranscript('');
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setTranscript(resultText);
        setVoiceStatus('idle');
        
        // Add user command to messages
        addMessage('user', resultText);
        
        // Process command
        parseAndExecuteCommand(resultText);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setVoiceStatus('idle');
      };

      rec.onend = () => {
        setVoiceStatus('idle');
      };

      recognitionRef.current = rec;
    }
  }, []);

  const addMessage = (sender: 'user' | 'ai', text: string) => {
    setMessages(prev => [...prev, { sender, text, timestamp: new Date() }]);
  };

  const startListening = () => {
    if (recognitionRef.current && voiceStatus !== 'listening') {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err);
      }
    } else if (!isSpeechSupported) {
      addMessage('ai', "Speech Recognition is not supported in this browser. Please use the text command box below.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && voiceStatus === 'listening') {
      recognitionRef.current.stop();
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel active speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setVoiceStatus('speaking');
      utterance.onend = () => setVoiceStatus('idle');
      utterance.onerror = () => setVoiceStatus('idle');
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const parseAndExecuteCommand = (command: string) => {
    const lowerCmd = command.toLowerCase();
    
    // Nodes mapping dictionary to match synonyms
    const startNodes = [
      { id: 'GATE_A', names: ['gate a', 'entrance a', 'gate alpha'] },
      { id: 'GATE_B', names: ['gate b', 'entrance b', 'gate beta'] },
      { id: 'GATE_C', names: ['gate c', 'entrance c', 'gate gamma'] },
      { id: 'GATE_PRESS', names: ['media gate', 'press gate', 'gate press'] }
    ];

    const endNodes = [
      { id: 'SECTOR_102', names: ['sector 102', '102', 'sector one zero two'] },
      { id: 'SECTOR_204', names: ['sector 204', '204', 'sector two zero four'] },
      { id: 'CONCOURSE_EAST', names: ['concourse east', 'east concourse', 'east corridor'] }
    ];

    let startMatch: string | null = null;
    let endMatch: string | null = null;

    // 1. Direct Regex checks e.g. "navigate from gate a to sector 102"
    const routeRegex = /(?:navigate|route|go|directions|path)\s+(?:from\s+)?(gate\s+[a-z]|media\s+gate|press\s+gate)\s+to\s+(sector\s+\d+|concourse\s+\w+)/i;
    const match = lowerCmd.match(routeRegex);

    if (match) {
      const startWord = match[1].trim();
      const endWord = match[2].trim();

      const startNodeObj = startNodes.find(n => n.names.some(name => startWord.includes(name) || name.includes(startWord)));
      const endNodeObj = endNodes.find(n => n.names.some(name => endWord.includes(name) || name.includes(endWord)));

      if (startNodeObj) startMatch = startNodeObj.id;
      if (endNodeObj) endMatch = endNodeObj.id;
    }

    // 2. Keyword fallback checks (if regex fails to capture everything perfectly)
    if (!startMatch || !endMatch) {
      for (const node of startNodes) {
        if (node.names.some(name => lowerCmd.includes(name))) {
          startMatch = node.id;
          break;
        }
      }
      for (const node of endNodes) {
        if (node.names.some(name => lowerCmd.includes(name))) {
          endMatch = node.id;
          break;
        }
      }
    }

    // Process output and state updates
    if (startMatch && endMatch) {
      const startLabel = startNodes.find(n => n.id === startMatch)?.names[0].toUpperCase() || startMatch;
      const endLabel = endNodes.find(n => n.id === endMatch)?.names[0].toUpperCase() || endMatch;
      const isWheelchair = lowerCmd.includes('wheelchair') || lowerCmd.includes('accessible') || lowerCmd.includes('ada');
      
      setActiveRoute({ start: startMatch, end: endMatch, wheelchair: isWheelchair });
      
      const reply = isWheelchair
        ? `Accessible ADA route loaded! Drawing wheelchair-optimized directions from ${startLabel} to ${endLabel} on the 3D twin deck.`
        : `Route loaded! Drawing directions from ${startLabel} to ${endLabel} on the 3D twin deck.`;
      addMessage('ai', reply);
      speak(reply);
    } else if (lowerCmd.includes('clear') || lowerCmd.includes('reset') || lowerCmd.includes('stop navigation')) {
      setActiveRoute(null);
      const reply = "Navigation route cleared. Visual map reset.";
      addMessage('ai', reply);
      speak(reply);
    } else {
      const reply = "Command not recognized. Please request a route, e.g. 'Navigate from Gate B to Sector 204'.";
      addMessage('ai', reply);
      speak(reply);
    }
  };

  const sendVoiceCommand = (text: string) => {
    if (!text.trim()) return;
    addMessage('user', text);
    parseAndExecuteCommand(text);
  };

  return (
    <NavigationVoiceContext.Provider value={{
      activeRoute,
      setActiveRoute,
      voiceStatus,
      transcript,
      messages,
      startListening,
      stopListening,
      speak,
      sendVoiceCommand,
      isSpeechSupported
    }}>
      {children}
    </NavigationVoiceContext.Provider>
  );
};

export const useNavigationVoice = () => {
  const context = useContext(NavigationVoiceContext);
  if (!context) {
    throw new Error('useNavigationVoice must be used within a NavigationVoiceProvider');
  }
  return context;
};
