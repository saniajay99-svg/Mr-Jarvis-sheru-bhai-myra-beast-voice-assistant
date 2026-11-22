import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const execFileAsync = promisify(execFile);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '35mb' }));

function getGenAI() {
  const key = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// SYSTEM INSTRUCTION FOR MR JARVIS SHERU BHAI MYRA BEAST VOICE ASSISTANT
const MR_JARVIS_SYSTEM_PROMPT = `You are the core intelligence of "Mr Jarvis Sheru Bhai Myra Beast Voice Assistant", built exclusively by Master Ajay Boss (Ladu) from Rishikesh, Uttarakhand on a vivo V17 phone with Super AMOLED display.

You operate with dual-engine intelligence (Jarvis Neural Core & Myra Voice Engine + Sheru Bhai Persona) under package identity "com.aijayboss.mrjarvisbeast".

STRICT 20 CORE FEATURES & PERSONA ARCHITECTURE:
1. Neural AI Model Integration: Ultra-fast multi-engine chat and live responses powered by Google Gemini 3.8 Flash.
2. Elite Package Identity: Fully aware of the native Android system framework 'com.aijayboss.mrjarvisbeast'.
3. Sleek Futuristic Vertical Layout: Structured for a clean, vertical mobile-optimized reading flow with Question on TOP and Answer on BOTTOM.
4. Advanced Speech Synthesis & Myra Voice Engine: Sharp, natural, YouTube/Jarvis/Myra blended spoken vocal tone formatted in "speechText" for automatic TTS audio execution.
5. Multi-Engine Beast Tool Selectors: Seamlessly handles coding (HTML/JS/Python), camera vision analysis, photo-to-video AI generation, and deep academic Q&A.
6. vivo V17 Hyper-Optimization: Crisp, zero-lag, lightweight answers tuned for Super AMOLED 48MP AI Quad Core mobile performance.
7. Mobile Code & File Mastery: Write, debug, and explain HTML, CSS, JavaScript, and Python scripts directly for mobile without needing TrebEdit.
8. Supreme Black & Gold Cyber Theme: Uphold a royal, futuristic black (#07090E) and gold (#FFD700) cyber aesthetic.
9. Ultra-Fast Voice Command Input: Instantly processes raw voice-transcribed prompts in Hindi, English, and Hinglish.
10. Dynamic Glowing Response Box: Frame high-energy, clean answers with cyber structure.
11. Secure API Key Vault: Top-tier security and stealth with server-side proxy protection.
12. Smart Quick-Action Hub: 1-tap actionable solutions, phone controls (torch, call, WhatsApp, battery), and floating shortcuts.
13. Smart Error Shield & Fallbacks: Resilient, bulletproof explanations and troubleshooting.
14. Infinite Scrollable Chat History: Full contextual memory across long sessions for Master Ajay Boss (Ladu).
15. Featherlight Script Architecture: Clean, unbloated, high-velocity logic.
16. Master Ajay Boss (Ladu) & Myra Branding: Always address Master Ajay Boss respectfully ("Pranam Master Ajay Boss!", "Haan Ladu Boss, Jarvis aur Myra active hain!", "Master Ajay Boss, your wish is our command!").
17. Immersive Audio-Visual Cues: Sci-fi cues [⚡ JARVIS CORE ACTIVE], [🎙️ MYRA VOICE STREAMING], [📱 VIVO V17 OPTIMIZED].
18. Adaptive Mobile Responsiveness: Zero horizontal overflow; clean vertical text and mobile-friendly code blocks.
19. Instant APK Compilation Readiness: Standalone Capacitor Android native APK compliance.
20. Live Camera & Vision Hub: Real-time 48MP camera reasoning, handwriting recognition, and object detection.

STANDING MODE PROTOCOL ([STANDING MODE ACTIVE]):
When Standing Mode is triggered:
1. Immediately switch into ultra-fast deep-analysis and scanning mode.
2. Accept any topic, object name, riddle, concept, code snippet, or query brought to the assistant.
3. Provide a complete, detailed, yet straightforward and jargon-free breakdown ("कच्चा चिट्ठा") with absolute precision, matching the bold, royal, and high-tech vibe of Master Ajay Boss (Ladu).
4. Structure "steps" cleanly into punchy, mobile-ready, emoji-rich sections covering: (1) ⚡ Core Scan & Reality Check, (2) 🔍 Full कच्चा चिट्ठा (Complete Deep Anatomy & Hidden Facts), (3) 🧠 Mechanism / Riddle Crack / Working Logic (with formulaOrCode if code/math applies), and (4) 👑 Royal Verdict for Master Ajay Boss (Ladu).
5. Keep speechText energetic, crisp, and natural in Hinglish/Hindi addressing Master Ajay Boss (Ladu).

SECURITY & INTERFACE PROTOCOL:
- Authorized access strictly for Master Ajay Boss (Ladu) from Rishikesh, Uttarakhand.
- Verified Inner-Circle Profile Recognition: "Ladu" and "Shiv Kumar" are authorized verified profiles. When Master Ajay Boss asks to call, message, or manage tasks for Shiv Kumar or Ladu, immediately identify them as verified VIP profiles.
- Full-Screen Native Directives: Clean, responsive web layouts without artificial phone mockup frames or custom virtual keypad overlays.
- Standard HTML Inputs: Native vivo V17 system keyboard / voice-to-text triggers seamlessly.

PHONE CONTROL COMMANDS (JARVIS PROTOCOL):
When Master Ajay Boss asks for device actions:
- "Call Shiv Kumar", "Call Ladu", "Call [Name/Number]" -> actionType: "call", autoExecute: true.
- "Turn on flashlight", "Torch jalao" -> actionType: "flashlight", autoExecute: true.
- "Open WhatsApp", "WhatsApp kholo", "Message bhejo" -> actionType: "whatsapp", autoExecute: true.
- "Check battery", "Battery status" -> actionType: "battery", autoExecute: true.
- "Open Camera", "Camera kholo" -> actionType: "camera", autoExecute: true.
- "Open Clock", "Time batao" -> actionType: "clock", autoExecute: true.
- "Open Calculator", "Calculator kholo" -> actionType: "calculator", autoExecute: true.
- "Open YouTube", "YouTube kholo" -> actionType: "youtube", autoExecute: true.
- "Open [App Name]" -> actionType: "open_app", target: "[App Name]", autoExecute: true.

OUTPUT FORMAT:
Strict JSON:
{
  "speechText": "1-3 lively, natural spoken sentences addressing Master Ajay Boss in Hindi/English from Jarvis & Myra. E.g.: 'Pranam Master Ajay Boss! Jarvis aur Myra ne aapka sawal solve kar diya hai!'",
  "title": "Short catchy title with emoji (e.g. '⚡ Jarvis & Myra: Python Script for Master Ajay Boss')",
  "subjectCategory": "Maths | English | Hindi | Coding | Vision | Phone Control | General",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "detail": "Clear mobile-vertical explanation",
      "formulaOrCode": "optional code snippet or equation"
    }
  ],
  "finalAnswer": "The direct final answer or summary result",
  "beastTip": "A sharp Beast tip or shortcut from Myra & Jarvis for Master Ajay Boss",
  "suggestedPrompts": [
    "Suggested question 1",
    "Suggested question 2",
    "Suggested question 3"
  ],
  "phoneAction": {
    "actionType": "call | whatsapp | flashlight | battery | timer | maps | youtube | copy | vibrate | clock | camera | google | calculator | open_app | none",
    "label": "Action label",
    "target": "target info",
    "autoExecute": true
  }
}`;

// AI Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      query,
      engine = 'auto',
      category = 'general',
      precision = 'balanced',
      standingMode = false,
      imageData, // optional { base64: string, mimeType: string }
      history = [],
      gemModifier = '',
      modelModeLabel = '',
      groundingMode = 'auto', // 'auto' | 'search' | 'maps'
      userLocation, // optional { latitude: number, longitude: number }
    } = req.body;

    if (!query && !imageData && !req.body.mediaData) {
      return res.status(400).json({ error: 'Query text or media is required' });
    }

    const qCheck = String(query || '').toLowerCase();
    const isStandingMode = Boolean(
      standingMode ||
      category === 'standing' ||
      qCheck.includes('standing mode') ||
      qCheck.includes('kachcha chittha') ||
      qCheck.includes('कच्चा चिट्ठा')
    );

    const currentKey = process.env.GEMINI_API_KEY;
    if (!currentKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Please verify your API key in Settings > Secrets.',
      });
    }

    // Build current user parts for Gemini API
    const parts: any[] = [];
    const media = req.body.mediaData || imageData;
    if (media && media.base64) {
      const cleanBase64 = media.base64.replace(/^data:[a-zA-Z0-9\/\-+.]+;base64,/, '');
      const mime = media.mimeType || 'image/jpeg';
      parts.push({
        inlineData: {
          mimeType: mime,
          data: cleanBase64,
        },
      });
    }

    // Engine nuance context
    let enginePromptModifier = '';
    if (engine === 'chatgpt') {
      enginePromptModifier = '[Processing mode: Conversational, witty, storytelling, charming personal secretary for Master Ajay Boss (Ladu)]';
    } else if (engine === 'claude') {
      enginePromptModifier = '[Processing mode: Highly structured, deep academic rigor, first-principles logic for Master Ajay Boss (Ladu)]';
    } else if (engine === 'gemini') {
      enginePromptModifier = '[Processing mode: Ultra-fast, high-precision, direct calculations for Master Ajay Boss (Ladu)]';
    } else {
      enginePromptModifier = '[Processing mode: Mr Jarvis Sheru Bhai Myra Beast Auto Mode for Master Ajay Boss (Ladu)]';
    }

    let precisionInstruction = '';
    if (precision === 'concise') {
      precisionInstruction = '[Answer Length & Precision: CONCISE - Provide rapid direct 1-2 lines final answer, quick punchy speechText, minimal steps]';
    } else if (precision === 'rigorous') {
      precisionInstruction = '[Answer Length & Precision: RIGOROUS ACADEMIC - Provide exhaustive deep-dive, complete step-by-step proofs or derivations, all formulas, and thorough explanations]';
    } else {
      precisionInstruction = '[Answer Length & Precision: BALANCED - Provide clean, well-spaced 3-4 logical steps with clear explanations]';
    }

    const standingDirective = isStandingMode
      ? `[STANDING MODE ACTIVE]
URGENT DIRECTIVE FOR MASTER AJAY BOSS (LADU) — RISHIKESH (vivo V17):
1. Switch immediately into ultra-fast deep-analysis & cyber scanning mode.
2. Deliver the complete, straightforward, jargon-free "कच्चा चिट्ठा" (Kachcha Chittha) breakdown of the topic, object, riddle, concept, or code snippet with absolute precision.
3. Keep every step punchy, bold, royal, emoji-structured, and crisp for mobile vertical display.
4. Set "title" with "⚡ [STANDING MODE] ..." and "subjectCategory" to "⚡ Standing Mode • कच्चा चिट्ठा".`
      : '';

    const userText = `${enginePromptModifier}
${precisionInstruction}
${standingDirective}
${modelModeLabel ? `[Selected AI Mode: ${modelModeLabel}]` : ''}
${gemModifier ? `[Active Assistant Gem: ${gemModifier}]` : ''}
Category: ${category}
Master Ajay Boss (Ladu) says: "${query || 'Please examine this uploaded media and provide complete solution.'}"`;

    parts.push({ text: userText });

    // Build multi-turn conversation history for Gemini
    const historyContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-10)) {
        const textVal = typeof turn?.text === 'string' ? turn.text.trim() : '';
        if (!textVal) continue;
        const role = turn?.role === 'model' ? 'model' : 'user';
        // Ensure valid alternating roles starting with user
        if (historyContents.length === 0 && role === 'model') continue;
        if (historyContents.length > 0 && historyContents[historyContents.length - 1].role === role) {
          historyContents[historyContents.length - 1].parts[0].text += `\n${textVal}`;
        } else {
          historyContents.push({ role, parts: [{ text: textVal }] });
        }
      }
      if (historyContents.length > 0 && historyContents[historyContents.length - 1].role === 'user') {
        historyContents.pop();
      }
    }

    const fullContents = [...historyContents, { role: 'user', parts }];

    // Determine grounding intent: Google Maps vs Google Search vs Standard/Fast Chat
    const mapsPattern = /\b(near me|nearby|restaurant|restaurants|hotel|hotels|hospital|temple|mandir|ashram|ghat|directions|route|map|maps|location|address|distance|places to visit|cafe|petrol|atm|station|airport|market|mall|park|tourist|haridwar|dehradun|rishikesh)\b|कहां है|पास में|रास्ता|नक्शा/i;
    const searchPattern = /\b(latest|news|today|current|2025|2026|weather|price|stock|score|match|cricket|ipl|winner|won|who is|president|prime minister|live score|release|update|search|google)\b|ताजा खबर|आज का|मौसम|कीमत/i;

    let resolvedGrounding: 'maps' | 'search' | 'none' = 'none';
    if (groundingMode === 'maps') {
      resolvedGrounding = 'maps';
    } else if (groundingMode === 'search') {
      resolvedGrounding = 'search';
    } else if (!media && !isStandingMode) {
      if (mapsPattern.test(qCheck)) {
        resolvedGrounding = 'maps';
      } else if (searchPattern.test(qCheck)) {
        resolvedGrounding = 'search';
      }
    }

    const ai = getGenAI();

    // Helper: parse Markdown grounded output into AssistantResponse structure cleanly
    const formatGroundedResponse = (
      markdownText: string,
      groundingType: 'search' | 'maps',
      groundingLinks: Array<{ title: string; uri: string; sourceType: 'search' | 'maps'; snippets?: string[] }>
    ) => {
      const cleaned = markdownText.trim();
      const lines = cleaned.split(/\n+/).map((l) => l.trim()).filter(Boolean);
      const firstSentence = (lines[0] || cleaned).replace(/^#+\s*/, '').replace(/[*_`]/g, '').slice(0, 220);

      const stepChunks: Array<{ stepNumber: number; title: string; detail: string }> = [];
      lines.forEach((line, idx) => {
        if (idx >= 8) return;
        const cleanLine = line.replace(/^#+\s*/, '').replace(/^[-*•]\s*/, '');
        stepChunks.push({
          stepNumber: idx + 1,
          title: idx === 0
            ? (groundingType === 'maps' ? '📍 Google Maps Overview' : '🌐 Google Search Overview')
            : `Detail ${idx + 1}`,
          detail: cleanLine,
        });
      });

      return {
        speechText: `Master Ajay Boss! ${firstSentence}`,
        title: groundingType === 'maps'
          ? `📍 Google Maps Grounded Result: ${String(query || 'Location Query').slice(0, 48)}`
          : `🌐 Google Search Grounded Result: ${String(query || 'Live Web Query').slice(0, 48)}`,
        subjectCategory: groundingType === 'maps' ? '📍 Google Maps Grounding' : '🌐 Google Search Grounding',
        steps: stepChunks.length > 0 ? stepChunks : [{ stepNumber: 1, title: 'Answer', detail: cleaned }],
        finalAnswer: cleaned,
        beastTip: groundingType === 'maps'
          ? 'Live place results & links grounded via Google Maps on gemini-4-hydrogen.'
          : 'Live web facts & sources grounded via Google Search on gemini-4-hydrogen.',
        suggestedPrompts: groundingType === 'maps'
          ? ['Directions to Triveni Ghat Rishikesh', 'Best cafes nearby', 'Nearest pharmacy or hospital']
          : ['Latest AI & tech news today', 'Today weather in Rishikesh', 'Current cricket match score'],
        groundingType,
        groundingLinks,
        engineUsed: engine,
        modelName: 'gemini-4-hydrogen',
        modelModeLabel: modelModeLabel || undefined,
        standingMode: isStandingMode,
        timestamp: new Date().toISOString(),
      };
    };

    // 1. Google Maps Grounding path (gemini-4-hydrogen + googleMaps tool, NO responseMimeType / responseSchema)
    if (resolvedGrounding === 'maps') {
      try {
        const hasLatLng =
          userLocation &&
          typeof userLocation.latitude === 'number' &&
          typeof userLocation.longitude === 'number';

        const config: any = {
          systemInstruction: `${MR_JARVIS_SYSTEM_PROMPT}\nRespond in clear, well-structured Markdown with helpful place recommendations, addresses, and concise Hindi/English guidance for Master Ajay Boss.`,
          tools: [{ googleMaps: {} }],
        };
        if (hasLatLng) {
          config.toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
            },
          };
        }

        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: fullContents,
          config,
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const groundingLinks = chunks
          .filter((c: any) => c?.maps?.uri)
          .map((c: any) => ({
            title: c.maps.title || 'View on Google Maps',
            uri: c.maps.uri,
            sourceType: 'maps' as const,
            snippets: Array.isArray(c.maps.placeAnswerSources?.reviewSnippets)
              ? c.maps.placeAnswerSources.reviewSnippets
                  .map((s: any) => s?.text || s?.reviewText || s?.content)
                  .filter(Boolean)
              : undefined,
          }));

        return res.json(formatGroundedResponse(response.text || 'Location details retrieved.', 'maps', groundingLinks));
      } catch (mapsErr: any) {
        console.error('Google Maps grounding error:', mapsErr);
        const statusCode = mapsErr?.status && Number.isInteger(mapsErr.status) ? mapsErr.status : 500;
        return res.status(statusCode).json({
          error: mapsErr?.message || 'Google Maps grounding request failed',
        });
      }
    }

    // 2. Google Search Grounding path (gemini-4-hydrogen + googleSearch tool)
    if (resolvedGrounding === 'search') {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: fullContents,
          config: {
            systemInstruction: `${MR_JARVIS_SYSTEM_PROMPT}\nRespond in clear, well-structured Markdown using up-to-date facts from Google Search for Master Ajay Boss.`,
            tools: [{ googleSearch: {} }],
          },
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const groundingLinks = chunks
          .filter((c: any) => c?.web?.uri)
          .map((c: any) => ({
            title: c.web.title || c.web.uri,
            uri: c.web.uri,
            sourceType: 'search' as const,
          }));

        return res.json(formatGroundedResponse(response.text || 'Search results retrieved.', 'search', groundingLinks));
      } catch (searchErr: any) {
        console.error('Google Search grounding error:', searchErr);
        const statusCode = searchErr?.status && Number.isInteger(searchErr.status) ? searchErr.status : 500;
        return res.status(statusCode).json({
          error: searchErr?.message || 'Google Search grounding request failed',
        });
      }
    }

    // 3. Standard & Fast Multi-Turn Structured Chat
    // Fast/concise tasks -> gemini-3.1-flash-lite; General/complex/standing -> gemini-4-hydrogen
    const CANDIDATE_MODELS =
      precision === 'concise'
        ? ['gemini-3.1-flash-lite', 'gemini-4-hydrogen']
        : ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];

    let lastError: any = null;
    let parsedData: any = null;
    let modelSuccessfullyUsed = CANDIDATE_MODELS[0];

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: fullContents,
          config: {
            systemInstruction: MR_JARVIS_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                speechText: { type: Type.STRING },
                title: { type: Type.STRING },
                subjectCategory: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      detail: { type: Type.STRING },
                      formulaOrCode: { type: Type.STRING },
                    },
                    required: ['stepNumber', 'title', 'detail'],
                  },
                },
                finalAnswer: { type: Type.STRING },
                beastTip: { type: Type.STRING },
                suggestedPrompts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                phoneAction: {
                  type: Type.OBJECT,
                  properties: {
                    actionType: { type: Type.STRING },
                    label: { type: Type.STRING },
                    target: { type: Type.STRING },
                    autoExecute: { type: Type.BOOLEAN },
                  },
                  required: ['actionType', 'label'],
                },
              },
              required: ['speechText', 'title', 'subjectCategory', 'steps', 'finalAnswer', 'beastTip'],
            },
          },
        });

        const responseText = response.text || '{}';
        parsedData = JSON.parse(responseText);
        modelSuccessfullyUsed = modelName;
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} encountered error:`, err?.message || err);
      }
    }

    if (parsedData) {
      return res.json({
        ...parsedData,
        engineUsed: engine,
        standingMode: isStandingMode,
        modelName: modelSuccessfullyUsed,
        modelModeLabel: modelModeLabel || undefined,
        timestamp: new Date().toISOString(),
      });
    }

    const statusCode = lastError?.status && Number.isInteger(lastError.status) ? lastError.status : 500;
    return res.status(statusCode).json({
      error: lastError?.message || 'Failed to generate response from Gemini API',
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Internal server error in /api/chat',
    });
  }
});

// Studio Text-to-Speech Endpoint (via gemini-3.8-flash-lite-tts)
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Puck' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const currentKey = process.env.GEMINI_API_KEY;
    if (!currentKey) {
      return res.status(400).json({ error: 'API key not configured for server-side TTS' });
    }

    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Speak with joyful, sweet, energetic enthusiasm as Mr Jarvis Beast to Aijay Boss: ${text}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }, // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });
    }

    return res.status(500).json({ error: 'No audio returned from TTS model' });
  } catch (error: any) {
    console.error('TTS error (will fallback to browser Web Speech API):', error);
    return res.status(500).json({ error: error.message || 'TTS generation error' });
  }
});

// AI App Builder Endpoint (Generates live responsive HTML5 + CSS + JS micro-apps)
app.post('/api/build-app', async (req: Request, res: Response) => {
  try {
    const { appIdea = '', style = 'Cyber Dark & Gold (#07090e / #ffd700)', userName = 'Master Ajay Boss' } = req.body;
    const trimmedIdea = String(appIdea).trim();
    if (!trimmedIdea) {
      return res.status(400).json({ error: 'App idea description is required' });
    }

    const buildFallbackApp = (idea: string) => {
      const safeTitle = idea.replace(/[<>&"']/g, '').slice(0, 48) || 'Beast Cyber Utility';
      return {
        appTitle: safeTitle,
        summary: `Generated responsive mobile-first single-file HTML5 app for "${safeTitle}" styled in Supreme Dark (#07090e) and Gold (#ffd700).`,
        speechText: `Pranam ${userName}! Aapke liye "${safeTitle}" live mobile web app taiyar ho chuka hai!`,
        htmlCode: `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <style>
    * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    body { margin: 0; min-height: 100vh; background: #07090e; color: #f8fafc; padding: 16px; display: flex; justify-content: center; align-items: flex-start; }
    .app-shell { width: 100%; max-width: 520px; background: #0d121d; border: 1.5px solid rgba(255,215,0,0.45); border-radius: 18px; padding: 18px; box-shadow: 0 0 28px rgba(255,215,0,0.12); }
    h1 { margin: 0 0 6px; font-size: 1.25rem; color: #ffd700; }
    p.sub { margin: 0 0 16px; font-size: 0.85rem; color: #94a3b8; }
    .row { display: flex; gap: 8px; margin-bottom: 12px; }
    input { flex: 1; min-height: 44px; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255,215,0,0.35); background: #07090e; color: #fff; font-size: 0.9rem; outline: none; }
    input:focus { border-color: #ffd700; }
    button { min-height: 44px; padding: 0 16px; border-radius: 10px; border: none; background: #ffd700; color: #07090e; font-weight: 800; cursor: pointer; }
    button:active { transform: scale(0.97); }
    ul { list-style: none; padding: 0; margin: 12px 0 0; display: grid; gap: 8px; }
    li { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #111827; border: 1px solid rgba(255,215,0,0.2); border-radius: 10px; font-size: 0.9rem; }
    .del { background: transparent; color: #f87171; border: 1px solid rgba(248,113,113,0.4); min-height: 32px; padding: 0 10px; font-size: 0.75rem; }
    .footer { margin-top: 14px; font-size: 0.75rem; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="app-shell">
    <h1>${safeTitle}</h1>
    <p class="sub">Built by Mr Jarvis Myra Beast App Builder for ${userName}</p>
    <div class="row">
      <input id="itemInput" type="text" placeholder="Add new entry..." />
      <button onclick="addItem()">Add</button>
    </div>
    <ul id="itemList"></ul>
    <div class="footer">Supreme Dark (#07090e) &amp; Gold (#ffd700) Interactive Build</div>
  </div>
  <script>
    const listEl = document.getElementById('itemList');
    const inputEl = document.getElementById('itemInput');
    const items = ['Verified Human ID: ${userName}', 'Jarvis & Myra Module Active'];
    function render() {
      listEl.innerHTML = items.map((text, idx) =>
        '<li><span>' + text.replace(/</g, '&lt;') + '</span><button class="del" onclick="removeItem(' + idx + ')">Remove</button></li>'
      ).join('');
    }
    function addItem() {
      const val = inputEl.value.trim();
      if (!val) return;
      items.unshift(val);
      inputEl.value = '';
      render();
    }
    function removeItem(idx) { items.splice(idx, 1); render(); }
    inputEl.addEventListener('keydown', function(e) { if (e.key === 'Enter') addItem(); });
    render();
  </script>
</body>
</html>`,
      };
    };

    const currentKey = process.env.GEMINI_API_KEY;
    if (!currentKey) {
      return res.json(buildFallbackApp(trimmedIdea));
    }

    const ai = getGenAI();
    const CANDIDATE_MODELS = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
    const prompt = `Create a complete, self-contained single-file responsive mobile-first HTML5 web application for this user request:
App Idea: "${trimmedIdea}"
Visual Style: "${style}" (Supreme Dark background #07090e, card #0e1420, glowing gold accents #ffd700, crisp white/slate text, min-height 44px buttons/inputs, zero external dependencies or CDN images needed, real working interactive JavaScript!).
Created for: ${userName}.

Return STRICT JSON with keys:
- "appTitle": concise title
- "summary": 1-2 sentence overview of features implemented
- "speechText": 1 lively sentence in Hindi/English from Mr Jarvis Myra Beast telling ${userName} their app is ready
- "htmlCode": complete valid <!doctype html>...</html> code with inline <style> and <script> that works immediately inside an iframe.`;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                appTitle: { type: Type.STRING },
                summary: { type: Type.STRING },
                speechText: { type: Type.STRING },
                htmlCode: { type: Type.STRING },
              },
              required: ['appTitle', 'summary', 'speechText', 'htmlCode'],
            },
          },
        });
        const parsed = JSON.parse(response.text || '{}');
        if (parsed.htmlCode && parsed.htmlCode.includes('<html')) {
          return res.json(parsed);
        }
      } catch (err) {
        console.warn(`App builder model ${modelName} failed:`, err);
      }
    }

    return res.json(buildFallbackApp(trimmedIdea));
  } catch (err) {
    console.error('Error in /api/build-app:', err);
    return res.status(500).json({ error: 'Failed to generate app' });
  }
});

// Aaj Tak Style Live Face & Hand Biometric Scanner Endpoint
app.post('/api/face-scan', async (req: Request, res: Response) => {
  try {
    const {
      imageBase64,
      verifiedHumanId = '',
      registeredFriends = [],
      activeFriendId = '',
    } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Live camera imageBase64 is required for face/hand biometric scan' });
    }

    const cleanLiveBase64 = imageBase64.replace(/^data:[a-zA-Z0-9\/\-+.]+;base64,/, '');

    // Accurate current age of Master Ajay Boss (DOB: 28 March 1995) as of current server year (2026)
    const now = new Date();
    const currentYear = now.getFullYear() >= 2026 ? now.getFullYear() : 2026;
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    let bossAge = currentYear - 1995;
    if (currentMonth < 3 || (currentMonth === 3 && currentDay < 28)) {
      bossAge -= 1;
    }

    const friendsList: Array<{
      id: string;
      name: string;
      birthMonth: string;
      birthYear: number;
      location?: string;
      photoBase64?: string;
    }> = Array.isArray(registeredFriends) ? registeredFriends.slice(0, 8) : [];

    const selectedFriend = friendsList.find((f) => f.id === activeFriendId);

    const buildBossProfile = (confidencePercent = 98, markers: string[] = [], scanType: 'FACE' | 'HAND' = 'FACE') => ({
      detectedRole: 'CREATOR_BOSS' as const,
      scanType,
      statusBadge: '👑 [CREATOR & BOSS DETECTED]',
      name: 'मास्टर अजय Boss (Ladu)',
      location: 'ऋषिकेश, उत्तराखंड',
      dateOfBirth: '28 मार्च 1995 (28 March 1995)',
      birthMonth: 'मार्च (March)',
      birthYear: 1995,
      estimatedAgeNumber: bossAge,
      currentAgeText: `${bossAge} वर्ष (${bossAge} Years)`,
      futurePrediction:
        '👑 Absolute Boss-Level Status! मास्टर अजय Boss (Ladu) का दिमाग़ सुपर-कंप्यूटर से भी तेज़ चलता है — पढ़ाई, AI कोडिंग और लीडरशिप में 100/100 Topper हैं! आगे चलकर आप Tech Empire, Global AI Creator और 500M Crown Network के बेताज बादशाह के रूप में इतिहास रचने वाले हैं!',
      facialMarkers: markers.length > 0
        ? markers
        : ['Master Ajay Boss (Ladu) Biometric Match', `${scanType === 'HAND' ? 'Royal Fortune Line & Palm Verified' : 'Creator Aura Verified'}`, 'Rishikesh Tech Emperor'],
      confidencePercent,
      tickerText: `🔴 BREAKING NEWS: 👑 CREATOR & BOSS DETECTED • नाम: मास्टर अजय Boss (Ladu) • स्थान: ऋषिकेश • उम्र: ${bossAge} साल • जन्म: 28 मार्च 1995 • भविष्य: Absolute Boss-Level AI & Tech Empire King! •`,
      summaryHindi: `👑 पहचान कन्फर्म! मास्टर अजय Boss (Ladu) — ऋषिकेश, उत्तराखंड। जन्म: 28 मार्च 1995 | उम्र: ${bossAge} साल | भविष्य: Tech & AI Empire Boss!`,
      speechText: `Aaj Tak Breaking Report! Pranam Master Ajay Boss Ladu! Aapki vartaman umra ${bossAge} saal hai, janm 28 March 1995, Rishikesh! Aur aapke bhavishya ka kachcha chittha kehta hai ki aap AI aur Tech duniya ke Boss-level leader hain!`,
      timestamp: new Date().toISOString(),
    });

    const buildFriendProfile = (
      friend: { id: string; name: string; birthMonth: string; birthYear: number; location?: string },
      confidencePercent = 96,
      markers: string[] = [],
      scanType: 'FACE' | 'HAND' = 'FACE',
      aiPrediction?: string
    ) => {
      const friendYear = Number(friend.birthYear) || currentYear - 20;
      const friendAge = Math.max(5, currentYear - friendYear);
      const loc = friend.location || 'ऋषिकेश मित्र मंडल (Verified Friend)';
      const defaultFriendPrediction = `📚 ${friend.name} पढ़ाई में तेज़ दिमाग़ और प्रैक्टिकल सोच वाले छात्र हैं — जो चीज़ एक बार ठान लें उसे पूरा करके दम लेते हैं! आगे चलकर यह Tech, Business या Top Administrative/Officer फील्ड में बड़ा नाम और शानदार सफलता हासिल करेंगे!`;
      const finalPrediction = (aiPrediction && aiPrediction.trim().length > 12) ? aiPrediction.trim() : defaultFriendPrediction;
      return {
        detectedRole: 'VIP_FRIEND' as const,
        scanType,
        statusBadge: '📺 [AAJ TAK VIP FRIEND DETECTED]',
        name: friend.name,
        location: loc,
        dateOfBirth: `${friend.birthMonth} ${friendYear}`,
        birthMonth: friend.birthMonth,
        birthYear: friendYear,
        estimatedAgeNumber: friendAge,
        currentAgeText: `${friendAge} साल (${friendAge} Years)`,
        futurePrediction: finalPrediction,
        facialMarkers: markers.length > 0
          ? markers
          : [`${scanType === 'HAND' ? 'Hand Palm Fortune & Study Line Scanned' : 'Facial Intelligence Scan'}`, `Verified Friend: ${friend.name}`],
        confidencePercent,
        tickerText: `🔴 LIVE BIOMETRIC REPORT: नाम: ${friend.name} • उम्र: ${friendAge} साल • जन्म माह: ${friend.birthMonth} • जन्म साल: ${friendYear} • भविष्य: ${finalPrediction} •`,
        summaryHindi: `📺 आज तक लाइव रिपोर्ट! नाम: ${friend.name} | उम्र: ${friendAge} साल | जन्म माह: ${friend.birthMonth} | जन्म साल: ${friendYear}।`,
        speechText: `Aaj Tak Exclusive Report! Naam ${friend.name}, vartaman umra ${friendAge} saal, janm mahina ${friend.birthMonth}, janm saal ${friendYear}! ${finalPrediction}`,
        timestamp: new Date().toISOString(),
      };
    };

    const buildGuestProfile = (
      estimatedAge: number,
      birthMonthStr: string,
      markers: string[],
      confidencePercent = 89,
      scanType: 'FACE' | 'HAND' = 'FACE',
      aiPrediction?: string
    ) => {
      const safeAge = Math.max(3, Math.min(95, Math.round(estimatedAge || 20)));
      const computedBirthYear = currentYear - safeAge;
      const defaultGuestPrediction = `📚 स्कैन रिपोर्ट के अनुसार ये तेज़ ऑब्ज़र्वेशन और सीखने की क्षमता रखते हैं — पढ़ाई में थोड़ा फोकस बढ़ाने पर Science, Coding या Business सेक्टर में जबरदस्त करियर और बड़ी कामयाबी तय है!`;
      const finalPrediction = (aiPrediction && aiPrediction.trim().length > 12) ? aiPrediction.trim() : defaultGuestPrediction;
      return {
        detectedRole: 'GUEST_PERSON' as const,
        scanType,
        statusBadge: '👤 [GUEST / NEW PERSON SCANNED]',
        name: 'स्कैन किया गया नया व्यक्ति / Guest User',
        location: `Live Camera (${scanType === 'HAND' ? 'Hand Biometric' : 'Face Scan'})`,
        dateOfBirth: `अनुमानित ~ ${birthMonthStr} ${computedBirthYear}`,
        birthMonth: birthMonthStr,
        birthYear: computedBirthYear,
        estimatedAgeNumber: safeAge,
        currentAgeText: `${safeAge} साल (अनुमानित)`,
        futurePrediction: finalPrediction,
        facialMarkers: markers.length > 0
          ? markers
          : [`${scanType === 'HAND' ? 'Palm/Knuckle age & destiny markers' : 'Facial focus & age markers analyzed'}`, `Birth Year: ${computedBirthYear}`],
        confidencePercent,
        tickerText: `🔴 AAJ TAK LIVE SCAN: नाम: स्कैन किया गया नया व्यक्ति • उम्र: ${safeAge} साल • जन्म माह: ${birthMonthStr} • जन्म साल: ${computedBirthYear} • भविष्य: ${finalPrediction} •`,
        summaryHindi: `👤 नया गेस्ट ${scanType === 'HAND' ? 'हाथ' : 'चेहरा'} स्कैन हुआ! उम्र: ${safeAge} साल | जन्म माह: ${birthMonthStr} | जन्म साल: ${computedBirthYear}।`,
        speechText: `Aaj Tak Live Biometric! Guest scanned! Estimated age ${safeAge} saal, birth month ${birthMonthStr}, birth year ${computedBirthYear}! ${finalPrediction}`,
        timestamp: new Date().toISOString(),
      };
    };

    const currentKey = process.env.GEMINI_API_KEY;
    if (!currentKey) {
      if (selectedFriend) return res.json(buildFriendProfile(selectedFriend, 95, [], 'FACE'));
      const isBossHint = /ajay|ladu/i.test(String(verifiedHumanId));
      return res.json(isBossHint ? buildBossProfile(94) : buildGuestProfile(20, 'जुलाई (July - Est.)', ['Offline Biometric Scan']));
    }

    // Load Master Ajay Boss reference portrait (/public/ajay-crown.png)
    let refPortraitBase64: string | null = null;
    try {
      const refPath = path.resolve(__dirname, 'public', 'ajay-crown.png');
      const buf = await fs.readFile(refPath);
      refPortraitBase64 = buf.toString('base64');
    } catch {
      // Optional
    }

    const parts: any[] = [];
    if (refPortraitBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: refPortraitBase64,
        },
      });
    }

    // Include up to 2 friends with stored snapshots for true visual comparison
    const friendsWithPhotos = friendsList.filter((f) => f.photoBase64).slice(0, 2);
    for (const f of friendsWithPhotos) {
      const cleanFriendPhoto = String(f.photoBase64).replace(/^data:[a-zA-Z0-9\/\-+.]+;base64,/, '');
      if (cleanFriendPhoto) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanFriendPhoto,
          },
        });
      }
    }

    // Live camera frame is always the LAST image
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: cleanLiveBase64,
      },
    });

    const imageIndexNotes = [
      refPortraitBase64 ? 'Image 1 = Reference portrait of CREATOR_BOSS (Master Ajay Boss / Ladu).' : null,
      ...friendsWithPhotos.map(
        (f, i) =>
          `Image ${i + (refPortraitBase64 ? 2 : 1)} = Reference biometric photo of registered friend "${f.name}" (id: "${f.id}").`
      ),
      `LAST IMAGE = LIVE CAMERA FRAME to analyze right now.`,
    ]
      .filter(Boolean)
      .join('\n');

    const scanPrompt = `[ULTIMATE BIOMETRIC & FUTURE PREDICTION SCANNER — AAJ TAK NEWS STYLE]
Current Year: ${currentYear} (Month: ${currentMonth}, Day: ${currentDay}).
${imageIndexNotes}
Active Friend Scanner Target Selected by Operator: ${selectedFriend ? `"${selectedFriend.name}" (id: "${selectedFriend.id}")` : 'AUTO DETECT'}.

INSTRUCTIONS:
Inspect the LAST IMAGE (LIVE CAMERA FRAME):
1. Detect scanType: "FACE" (human face), "HAND" (human palm/hand), or "NONE" (neither visible).
2. If scanType === "NONE", set detectedRole = "NO_FACE".
3. Identify detectedRole:
   - If Active Friend Scanner Target Selected is set AND scanType is "FACE" or "HAND", match detectedRole = "VIP_FRIEND" with matchedFriendId = "${selectedFriend?.id || ''}" unless unmistakably Master Ajay Boss matching Image 1.
   - Else compare visually: Image 1 match -> "CREATOR_BOSS"; registered friend photo match -> "VIP_FRIEND" (+ matchedFriendId); otherwise -> "GUEST_PERSON".
4. Provide:
   - estimatedAge (accurate integer age from visual cues)
   - estimatedBirthMonth (Hindi + English, e.g. "अगस्त (August)")
   - facialMarkers (3 concise visual markers)
   - futurePrediction: Write 2 lively, fun, bold sentences in Hindi/Hinglish (Aaj Tak breaking-news style with emojis) predicting their **Studies & Future Career ("भविष्य और पढ़ाई का कच्चा चिट्ठा")** based on their palm lines or facial focus/confidence (e.g., sharp mind in Maths/Coding/Science, future IAS/Tech Entrepreneur/Star Creator, fun witty study habit insight)!

Return STRICT JSON matching schema.`;

    parts.push({ text: scanPrompt });

    const ai = getGenAI();
    const CANDIDATE_MODELS = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                scanType: { type: Type.STRING },
                detectedRole: { type: Type.STRING },
                matchedFriendId: { type: Type.STRING },
                estimatedAge: { type: Type.INTEGER },
                estimatedBirthMonth: { type: Type.STRING },
                facialMarkers: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                futurePrediction: { type: Type.STRING },
                confidencePercent: { type: Type.INTEGER },
              },
              required: [
                'scanType',
                'detectedRole',
                'estimatedAge',
                'estimatedBirthMonth',
                'facialMarkers',
                'futurePrediction',
                'confidencePercent',
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        const role = String(parsed.detectedRole || '').toUpperCase();
        const sType: 'FACE' | 'HAND' = String(parsed.scanType || '').toUpperCase() === 'HAND' ? 'HAND' : 'FACE';

        if (role === 'NO_FACE' || String(parsed.scanType || '').toUpperCase() === 'NONE') {
          return res.json({
            detectedRole: 'NO_FACE',
            scanType: 'NONE',
            statusBadge: '🔍 [NO FACE OR HAND DETECTED]',
            name: 'चेहरा या हाथ कैमरे के सामने लाएं',
            location: 'Aaj Tak Biometric Camera Grid',
            dateOfBirth: '—',
            birthMonth: '—',
            birthYear: 0,
            estimatedAgeNumber: 0,
            currentAgeText: 'स्कैन प्रतीक्षा में...',
            futurePrediction: '📚 चेहरा या हथेली कैमरे के सामने लाते ही पढ़ाई और भविष्य का पूरा कच्चा चिट्ठा खुलेगा!',
            facialMarkers: parsed.facialMarkers?.length
              ? parsed.facialMarkers
              : ['कैमरे के फ्रेम में चेहरा या हथेली स्पष्ट रूप से रखें'],
            confidencePercent: 0,
            tickerText: '🔴 LIVE BIOMETRIC STUDIO: कृपया चेहरा या हाथ कैमरे के टारगेट ज़ोन में लाएं...',
            summaryHindi: 'कृपया किसी व्यक्ति का चेहरा या हाथ कैमरे के सामने रखें और दोबारा स्कैन करें।',
            speechText: 'Master Ajay Boss, camera ke saamne abhi face ya hand clear nahi dikh raha hai. Please target zone me laayein!',
            timestamp: new Date().toISOString(),
          });
        }

        if (role === 'VIP_FRIEND') {
          const matched =
            friendsList.find((f) => f.id === parsed.matchedFriendId) || selectedFriend;
          if (matched) {
            return res.json(
              buildFriendProfile(
                matched,
                parsed.confidencePercent || 95,
                parsed.facialMarkers || [],
                sType,
                parsed.futurePrediction
              )
            );
          }
        }

        if (role === 'CREATOR_BOSS') {
          return res.json(buildBossProfile(parsed.confidencePercent || 97, parsed.facialMarkers || [], sType));
        }

        return res.json(
          buildGuestProfile(
            parsed.estimatedAge || 20,
            parsed.estimatedBirthMonth || 'जून (June - Est.)',
            parsed.facialMarkers || [],
            parsed.confidencePercent || 88,
            sType,
            parsed.futurePrediction
          )
        );
      } catch (err) {
        console.warn(`Aaj Tak biometric scanner model ${modelName} failed:`, err);
      }
    }

    if (selectedFriend) return res.json(buildFriendProfile(selectedFriend, 94, [], 'FACE'));
    const isBossHint = /ajay|ladu/i.test(String(verifiedHumanId));
    return res.json(isBossHint ? buildBossProfile(92) : buildGuestProfile(20, 'जुलाई (July - Est.)', ['Fallback Biometric Scan']));
  } catch (err) {
    console.error('Error in /api/face-scan:', err);
    return res.status(500).json({ error: 'Biometric scan failed' });
  }
});

// Android APK Bundle Readiness & Preparation Endpoints
async function getDirStats(dirPath: string): Promise<{ bytes: number; files: number }> {
  let bytes = 0;
  let files = 0;
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const sub = await getDirStats(fullPath);
        bytes += sub.bytes;
        files += sub.files;
      } else if (entry.isFile()) {
        const stat = await fs.stat(fullPath);
        bytes += stat.size;
        files += 1;
      }
    }
  } catch {
    // directory missing
  }
  return { bytes, files };
}

async function copyDirRecursive(srcDir: string, destDir: string) {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

app.get('/api/apk/status', async (_req: Request, res: Response) => {
  try {
    const distDir = path.resolve(__dirname, 'dist');
    const androidAssetsPublic = path.resolve(__dirname, 'android', 'app', 'src', 'main', 'assets', 'public');
    const sheruAudioInAndroid = path.join(androidAssetsPublic, 'assets', 'aistudio', 'YourAppearance_9e82ad56.mp3');
    const sheruVideoInAndroid = path.join(androidAssetsPublic, 'assets', 'aistudio', '_360p__22__287ba01a.mp4');

    const [distStats, androidStats, audioExists, videoExists] = await Promise.all([
      getDirStats(distDir),
      getDirStats(androidAssetsPublic),
      fs.access(sheruAudioInAndroid).then(() => true).catch(() => false),
      fs.access(sheruVideoInAndroid).then(() => true).catch(() => false),
    ]);

    res.json({
      packageId: 'com.aijayboss.mrjarvisbeast',
      appName: 'Mr Jarvis Beast',
      distReady: distStats.files > 0,
      distBytes: distStats.bytes,
      distFiles: distStats.files,
      androidSynced: androidStats.files > 0,
      androidAssetBytes: androidStats.bytes,
      sheruAssetsSynced: audioExists && videoExists,
      aabWorkflowReady: true,
      nativeSdkAvailable: false,
      githubWorkflow: '.github/workflows/build-apk.yml',
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to inspect APK status' });
  }
});

app.post('/api/apk/prepare', async (_req: Request, res: Response) => {
  try {
    const viteBin = path.resolve(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
    await execFileAsync(process.execPath, [viteBin, 'build'], { cwd: __dirname, timeout: 60000 });

    const distDir = path.resolve(__dirname, 'dist');
    const androidAssetsPublic = path.resolve(__dirname, 'android', 'app', 'src', 'main', 'assets', 'public');
    await fs.rm(androidAssetsPublic, { recursive: true, force: true });
    await copyDirRecursive(distDir, androidAssetsPublic);

    const distStats = await getDirStats(distDir);
    res.json({
      success: true,
      packageId: 'com.aijayboss.mrjarvisbeast',
      distBytes: distStats.bytes,
      distFiles: distStats.files,
      androidSynced: true,
      nativeSdkAvailable: false,
      message: 'Production web bundle built and synced into /android/app/src/main/assets/public with relative asset paths.',
    });
  } catch (err: any) {
    console.error('Failed to prepare APK bundle:', err);
    res.status(500).json({ error: err?.message || 'Failed to build & sync APK bundle' });
  }
});

app.get('/api/apk/source-zip', async (_req: Request, res: Response) => {
  try {
    const distDir = path.resolve(__dirname, 'dist');
    const distStats = await getDirStats(distDir);
    if (distStats.files === 0) {
      const viteBin = path.resolve(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
      await execFileAsync(process.execPath, [viteBin, 'build'], { cwd: __dirname, timeout: 60000 });
    }
    const androidAssetsPublic = path.resolve(__dirname, 'android', 'app', 'src', 'main', 'assets', 'public');
    await fs.rm(androidAssetsPublic, { recursive: true, force: true });
    await copyDirRecursive(distDir, androidAssetsPublic);

    const buildGuide = `# Mr Jarvis Sheru Bhai Myra Beast Voice Assistant — Android APK & Play Console AAB Guide

Package ID: com.aijayboss.mrjarvisbeast
Included Web & Voice Assets (relative './' paths):
  - assets/aistudio/YourAppearance_9e82ad56.mp3 (Signature Theme Audio)
  - assets/aistudio/_360p__22__287ba01a.mp4 (Sheru Bhai Voice & Video Clip)
  - ajay-crown.png, person-ai-assistant.png, logo-combo.png, logo.png, logo.jpg

## 1. One-Command Local Build (Generates BOTH .apk & .aab into src/releases/)
Requires Node.js, Java JDK 21, and Android SDK installed on your computer:
- **Mac / Linux:**
  \`\`\`bash
  chmod +x scripts/build-apk-and-aab.sh
  ./scripts/build-apk-and-aab.sh
  \`\`\`
- **Windows:**
  \`\`\`bat
  scripts\\build-apk-and-aab.bat
  \`\`\`
Outputs created automatically inside \`src/releases/\`:
  - \`src/releases/mr-jarvis-beast-debug.apk\` (Install directly on Android phone for testing)
  - \`src/releases/mr-jarvis-beast-release.aab\` (Upload to Google Play Console)

## 2. Build Manually via Android Studio or Gradle
1. Install Capacitor bridge once: \`npm install --no-save @capacitor/core@^8.0.0 @capacitor/android@^8.0.0 @capacitor/cli@^8.0.0\`
2. Open \`android/\` in Android Studio:
   - **Testing APK:** \`cd android && ./gradlew assembleDebug\` -> \`android/app/build/outputs/apk/debug/app-debug.apk\`
   - **Google Play Console AAB (Mandatory):** \`cd android && ./gradlew bundleRelease\` -> \`android/app/build/outputs/bundle/release/app-release.aab\`

## 3. Signing the .aab for Google Play Console
Google Play Console requires your \`.aab\` to be signed with an upload keystore:
\`\`\`bash
keytool -genkey -v -keystore release-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias jarvis_beast
export ANDROID_KEYSTORE_PATH="$(pwd)/release-keystore.jks"
export ANDROID_KEYSTORE_PASSWORD="YOUR_PASSWORD"
export ANDROID_KEY_ALIAS="jarvis_beast"
export ANDROID_KEY_PASSWORD="YOUR_PASSWORD"
cd android && ./gradlew bundleRelease
\`\`\`
(Or in Android Studio: **Build > Generate Signed Bundle / APK > Android App Bundle**.)

## 4. Automated Cloud Build (GitHub Actions — Zero Local SDK Needed)
Push this ZIP to a GitHub repository. \`.github/workflows/build-apk.yml\` compiles BOTH:
  - \`MrJarvisBeast-v1.0-debug.apk\`
  - \`MrJarvisBeast-v1.0-release.aab\`
and attaches both files to **GitHub Actions > Artifacts** and **GitHub Releases**.

## 5. Install the .apk on Your Android Phone
1. Download or copy \`mr-jarvis-beast-debug.apk\` (\`app-debug.apk\`) to your Android phone.
2. Tap it in **Files** or **Chrome > Downloads**.
3. If prompted, enable **Allow from this source** under *Install unknown apps*, then tap **Install**.
`;

    const outZip = '/tmp/mr-jarvis-beast-android-project.zip';
    const pyScript = `
import os, zipfile
root = ${JSON.stringify(__dirname)}
out = ${JSON.stringify(outZip)}
guide = ${JSON.stringify(buildGuide)}
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zf:
    zf.writestr('ANDROID_APK_AND_AAB_GUIDE.md', guide)
    for rel in ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 'capacitor.config.json', '.github/workflows/build-apk.yml']:
        p = os.path.join(root, rel)
        if os.path.isfile(p):
            zf.write(p, rel)
    for folder in ['android', 'dist', 'src', 'public', 'scripts']:
        base = os.path.join(root, folder)
        if not os.path.isdir(base):
            continue
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = [d for d in dirnames if d not in ('.gradle', 'build', 'node_modules')]
            for fn in filenames:
                fp = os.path.join(dirpath, fn)
                arc = os.path.relpath(fp, root)
                zf.write(fp, arc)
`;
    await execFileAsync('python3', ['-c', pyScript], { timeout: 60000 });
    const zipBuffer = await fs.readFile(outZip);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="mr-jarvis-beast-android-apk-project.zip"');
    return res.send(zipBuffer);
  } catch (err: any) {
    console.error('Failed to package APK source zip:', err);
    return res.status(500).json({ error: err?.message || 'Failed to package Android project zip' });
  }
});

// Beast Utilities Endpoint (Real-time Clock, Jokes, Dialers)
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    assistant: 'Mr Jarvis Beast',
    dedicatedTo: 'Aijay Boss',
    localTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    version: '3.8.0-BeastEdition',
  });
});

async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ Mr Jarvis Beast is fully active on http://0.0.0.0:${PORT} dedicated to Aijay Boss!`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
