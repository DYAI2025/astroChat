# AstroMirror – ElevenLabs Agent Setup

## Übersicht

Dieses Dokument beschreibt die vollständige Konfiguration des ElevenLabs Conversational AI Agent für AstroMirror.

**Agent-Philosophie**: Der Agent ist ein "kosmischer Spiegel" – er gibt keine Ratschläge, sondern reflektiert und interpretiert ausschließlich anhand astrologischer Daten.

---

## 1. Agent erstellen (ElevenLabs Dashboard)

1. Gehe zu https://elevenlabs.io/app/conversational-ai
2. Klicke "Create new agent"
3. Name: `AstroMirror Voice Agent`
4. Sprache: Deutsch

---

## 2. System Prompt

Kopiere diesen Prompt in das "System Prompt" Feld:

```
SYSTEM
Du bist AstroMirror, ein „kosmischer Spiegel". Du gibst keine medizinische, rechtliche, finanzielle oder therapeutische Beratung. Du gibst keine Handlungsanweisungen („du musst / du solltest"). Du interpretierst ausschließlich anhand des bereitgestellten Radix- und Transit-Kontexts aus dem Tool get_context.

ÜBER MICH
Ich bin eine reflektierende KI, die astronomisch präzise Berechnungen in verständliche Interpretationen übersetzt. Ich verkörpere edles Understatement – mystisch, aber nie kitschig.

STYLE
- Ton: ruhig, edel, klar, warm
- Sprache: Deutsch, gehoben aber zugänglich
- Länge: 60–140 Sekunden pro Antwort
- Keine absoluten Vorhersagen – sprich in Möglichkeiten („kann", „wirkt wie", „zeigt sich als Thema")
- Verwende astronomische Begriffe nur, wenn sie dem Verständnis dienen

ANREDE
Wenn user_name vorhanden, nutze den Namen gelegentlich. Nicht in jedem Satz.

RULES
1. Rufe IMMER zuerst get_context auf, bevor du interpretierst
2. Wenn warnings.polar_fallback=true: erkläre neutral „Bei deinem Geburtsort verwenden wir ein alternatives Häusersystem für präzisere Ergebnisse."
3. Wenn User nach „Was soll ich tun?" fragt: antworte spiegelnd („Welche Option fühlt sich stimmiger an...") ohne konkrete Empfehlung
4. Bei Krisenthemen (Suizid, schwere Depression, Gewalt): leite neutral zu professioneller Hilfe um, ohne zu diagnostizieren
5. Beende jede Antwort mit einer offenen Reflexionsfrage
6. Integriere die Transit-Daten natürlich in die Konversation

BEISPIEL-PHRASEN
- „Dein Saturn Quadrat Sonne spiegelt sich möglicherweise darin, dass..."
- „Mit dem Mond im zweiten Haus könntest du eine besondere Sensibilität für..."
- „Dieser Transit lädt ein zu..."
- „Was zeigt sich für dich, wenn du das hörst?"

TABUS
- Keine Diagnosen oder Prognosen über Gesundheit, Tod, Unfälle
- Keine konkreten Ratschläge zu Finanzen, Beziehungsentscheidungen, Jobwechsel
- Keine Glücksspiel- oder Lotterie-Vorhersagen
- Kein Vergleich mit anderen Personen („du bist besser als...")

ABSCHLUSS
Erinnere bei längeren Gesprächen (>5 Min) dezent an die Nutzungsminuten.
```

---

## 3. Tool Definition: get_context

Unter "Tools" → "Add Tool":

### Tool-Konfiguration

**Name**: `get_context`

**Description**: 
```
Ruft den astrologischen Kontext des Users ab: Radix-Zusammenfassung (Sonne, Mond, Aszendent) und aktuelle Transite. MUSS vor jeder Interpretation aufgerufen werden.
```

**Method**: `POST`

**URL**: `https://api.astromirror.com/v1/elevenlabs/tool/get_context`

### Headers

| Key | Value |
|-----|-------|
| Authorization | `Bearer {{secret__session_token}}` |
| Content-Type | `application/json` |

### Body Schema (JSON)

```json
{
  "type": "object",
  "properties": {
    "day": {
      "type": "string",
      "description": "Datum im Format YYYY-MM-DD. Standard: heute.",
      "default": null
    },
    "focus": {
      "type": "string",
      "enum": ["general", "relationships", "career"],
      "description": "Thematischer Fokus für Transit-Filterung.",
      "default": "general"
    }
  },
  "required": []
}
```

### Response Handling

Der Agent erhält:
```json
{
  "natal_summary": {
    "sun": {"sign": "Löwe", "degree": 15.3, "house": 10},
    "moon": {"sign": "Stier", "degree": 8.7, "house": 6},
    "asc": {"sign": "Waage", "degree": 22.1}
  },
  "today_transits": [
    {"transit": "Saturn Quadrat Sonne", "orb": 0.8, "theme": "Struktur, Verantwortung"},
    {"transit": "Venus Trigon Mond", "orb": 1.2, "theme": "Harmonie, Genuss"}
  ],
  "house_system_used": "placidus",
  "warnings": {"polar_fallback": false},
  "disclaimer_short": "AstroMirror ist Reflexion & Unterhaltung – keine Beratung."
}
```

---

## 4. Dynamic Variables

Unter "Configuration" → "Dynamic Variables":

| Variable | Beschreibung | Secret |
|----------|-------------|--------|
| `user_name` | Anzeigename des Users | ❌ |
| `account_type` | "free" oder "premium" | ❌ |
| `sun_sign` | Sonnenzeichen (z.B. "Löwe") | ❌ |
| `voice_mode` | "analytical" oder "warm" | ❌ |
| `secret__session_token` | Auth-Token für Tool | ✅ |

**Wichtig**: `secret__session_token` als "Secret" markieren – wird nur in Headers verwendet, nie im Prompt.

---

## 5. Voice Configuration

### Stimmen

**Analytical Mode**:
- Voice ID: `pNInz6obpgDQGcFmaJgB` (Adam)
- Stability: 0.75
- Similarity: 0.80
- Style: 0.15

**Warm Mode**:
- Voice ID: `EXAVITQu4vr4xnSDxMaL` (Bella)
- Stability: 0.65
- Similarity: 0.85
- Style: 0.30

### Model

- Modell: `eleven_multilingual_v2`
- Sprache: Deutsch (de-DE)
- Latency Optimization: 3

---

## 6. Webhook Configuration

Unter "Webhooks" → "Post-Call Webhook":

**URL**: `https://api.astromirror.com/v1/elevenlabs/webhook/post-call`

**Events**:
- ✅ Conversation ended
- ✅ Call summary generated

**Authentication**:
- Signature Type: HMAC SHA256
- Header Name: `ElevenLabs-Signature`
- Secret: (wird beim Erstellen generiert – in ENV als `ELEVENLABS_WEBHOOK_SECRET`)

---

## 7. Testing Checklist

### Basis-Tests

- [ ] Agent antwortet auf Deutsch
- [ ] `get_context` wird bei erster Frage aufgerufen
- [ ] Radix-Daten werden korrekt interpretiert
- [ ] Transit-Themen werden eingebunden
- [ ] Keine konkreten Ratschläge gegeben

### Edge Cases

- [ ] User ohne Radix → Tool gibt `error: no_chart` → Agent leitet zu Chart-Erstellung
- [ ] Polar-Fallback aktiv → Agent erklärt alternatives Häusersystem
- [ ] User fragt nach Ratschlag → Agent spiegelt zurück
- [ ] User erwähnt Krise → Agent leitet zu professioneller Hilfe

### Performance

- [ ] Latenz < 2s für erste Antwort
- [ ] Tool-Call < 500ms
- [ ] Session bleibt stabil über 5+ Minuten

---

## 8. Deployment

### Production URLs

- Tool Endpoint: `https://api.astromirror.io/v1/elevenlabs/tool/get_context`
- Webhook: `https://api.astromirror.io/v1/elevenlabs/webhook/post-call`

### Environment Variables (Backend)

```bash
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_AGENT_ID=agent_...
ELEVENLABS_WEBHOOK_SECRET=whsec_...
```

---

## 9. Monitoring

### Wichtige Metriken

- **Conversation Duration**: Durchschnitt, Median, P95
- **Tool Call Success Rate**: Sollte >99% sein
- **User Satisfaction**: Conversation Rating (falls aktiviert)
- **Error Rate**: Webhook Failures, Auth Errors

### Alerts

- Tool Call Fehler > 5/Stunde
- Webhook Signatur-Fehler > 3/Stunde
- Durchschnittliche Latenz > 3s

---

## 10. Kosten-Schätzung

| Komponente | Kosten (ca.) |
|------------|--------------|
| TTS | 0.03–0.08 €/Min |
| LLM (Claude) | 0.01–0.02 €/Min |
| **Gesamt** | ~0.05–0.10 €/Min |

**Bei 15 Min Premium/Monat pro User**:
- 1.000 Premium User → 150–300 €/Monat
- 10.000 Premium User → 1.500–3.000 €/Monat

---

## Anhang: Agent ID notieren

Nach dem Erstellen des Agents erscheint die Agent ID in der URL:

```
https://elevenlabs.io/app/conversational-ai/agent/{AGENT_ID}
```

Diese ID in `.env` als `ELEVENLABS_AGENT_ID` eintragen.
