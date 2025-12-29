import { GEMINI_CONFIG, SYSTEM_PROMPTS } from '../config/gemini';

// TODO: In production, proxy this through your backend to hide API keys
// Backend should validate requests, add rate limiting, and log usage

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface DealRequestSuggestion {
  questions: string[];
  problemDescription: string;
  suggestedCategory: string;
  urgencyNote?: string;
}

interface SearchSuggestion {
  category: string;
  urgency: 'low' | 'medium' | 'high' | null;
  extractedIntent: string;
}

interface ReplySuggestion {
  accept: string;
  reject: string;
  waitlist: string;
}

class AIService {
  private async callGemini(prompt: string, systemContext?: string): Promise<string> {
    try {
      const fullPrompt = systemContext 
        ? `${SYSTEM_PROMPTS.BASE}

${systemContext}

User: ${prompt}`
        : `${SYSTEM_PROMPTS.BASE}\n\nUser: ${prompt}`;

      const response = await fetch(
        `${GEMINI_CONFIG.API_URL}?key=${GEMINI_CONFIG.API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
              topP: 0.8,
              topK: 40,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from AI');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  // CUSTOMER FEATURE: Deal Request Helper
  async getDealRequestHelp(userInput: string): Promise<DealRequestSuggestion> {
    const prompt = `A customer needs help describing their problem: "${userInput}"

Ask 2-3 specific clarifying questions to understand:
1. What exactly needs to be done
2. When they need it done
3. Any specific requirements

Then provide:
1. A clear problem description (2-3 sentences)
2. The best category from: Plumber, Electrician, Carpenter, Cleaner, Painter, AC Technician, Appliance Repair
3. Urgency level if mentioned: urgent, today, this week, flexible

Format your response as:
QUESTIONS:
- [Question 1]
- [Question 2]
- [Question 3]

DESCRIPTION:
[Clear problem description]

CATEGORY:
[Category name]

URGENCY:
[Urgency note if applicable]`;

    const response = await this.callGemini(prompt, SYSTEM_PROMPTS.CUSTOMER);
    
    // Parse the response
    const questions = this.extractSection(response, 'QUESTIONS:', 'DESCRIPTION:')
      .split('\n')
      .filter(q => q.trim().startsWith('-'))
      .map(q => q.replace(/^-\s*/, '').trim());

    const problemDescription = this.extractSection(response, 'DESCRIPTION:', 'CATEGORY:').trim();
    const suggestedCategory = this.extractSection(response, 'CATEGORY:', 'URGENCY:').trim();
    const urgencyNote = this.extractSection(response, 'URGENCY:', '').trim() || undefined;

    return {
      questions: questions.slice(0, 3),
      problemDescription: problemDescription || userInput,
      suggestedCategory: suggestedCategory || 'General',
      urgencyNote,
    };
  }

  // CUSTOMER FEATURE: Search Assist
  async analyzeSearchQuery(query: string): Promise<SearchSuggestion> {
    const prompt = `Analyze this search query: "${query}"

Extract:
1. What category of worker they need: Plumber, Electrician, Carpenter, Cleaner, Painter, AC Technician, Appliance Repair, or General
2. Urgency level: urgent (emergency/today), high (within 2 days), medium (this week), low (flexible)
3. What they're actually looking for

Format:
CATEGORY:
[Category name]

URGENCY:
[urgent/high/medium/low/none]

INTENT:
[What they need in simple terms]`;

    const response = await this.callGemini(prompt, SYSTEM_PROMPTS.CUSTOMER);

    const category = this.extractSection(response, 'CATEGORY:', 'URGENCY:').trim();
    const urgencyText = this.extractSection(response, 'URGENCY:', 'INTENT:').trim().toLowerCase();
    const intent = this.extractSection(response, 'INTENT:', '').trim();

    let urgency: 'low' | 'medium' | 'high' | null = null;
    if (urgencyText.includes('urgent') || urgencyText.includes('emergency')) {
      urgency = 'high';
    } else if (urgencyText.includes('high')) {
      urgency = 'high';
    } else if (urgencyText.includes('medium')) {
      urgency = 'medium';
    } else if (urgencyText.includes('low') || urgencyText.includes('flexible')) {
      urgency = 'low';
    }

    return {
      category: category || 'General',
      urgency,
      extractedIntent: intent || query,
    };
  }

  // WORKER FEATURE: Request Reply Suggestions
  async getRequestReplySuggestions(
    customerName: string,
    problem: string,
    location: string
  ): Promise<ReplySuggestion> {
    const prompt = `Generate professional reply suggestions for a worker responding to this job request:

Customer: ${customerName}
Problem: ${problem}
Location: ${location}

Provide 3 short, professional replies (max 2 sentences each):
1. ACCEPT: Positive, confirms availability, mentions visit/inspection
2. REJECT: Polite, brief reason (too far/busy/not my expertise)
3. WAITLIST: Shows interest but currently busy, mentions follow-up

Format:
ACCEPT:
[Reply text]

REJECT:
[Reply text]

WAITLIST:
[Reply text]`;

    const response = await this.callGemini(prompt, SYSTEM_PROMPTS.WORKER);

    return {
      accept: this.extractSection(response, 'ACCEPT:', 'REJECT:').trim() || 
              `Thanks for reaching out! I'm available and would be happy to help. I can visit ${location} to assess the work.`,
      reject: this.extractSection(response, 'REJECT:', 'WAITLIST:').trim() || 
              `Thank you for considering me. Unfortunately, I'm unable to take this job at this time.`,
      waitlist: this.extractSection(response, 'WAITLIST:', '').trim() || 
               `Thanks for your request! I'm currently busy but very interested. Can I follow up with you in 2-3 days?`,
    };
  }

  // WORKER FEATURE: Chat Reply Suggestions
  async getChatReplySuggestions(
    lastMessage: string,
    conversationContext?: string
  ): Promise<string[]> {
    const prompt = `Generate 3 short, professional reply options for this message:

Last message: "${lastMessage}"
${conversationContext ? `Context: ${conversationContext}` : ''}

Provide 3 different reply styles:
1. Professional and detailed
2. Brief and friendly
3. Question to clarify/continue conversation

Keep each reply under 30 words.

Format:
1. [Reply option 1]
2. [Reply option 2]
3. [Reply option 3]`;

    const response = await this.callGemini(prompt, SYSTEM_PROMPTS.WORKER);

    const replies = response
      .split('\n')
      .filter(line => /^\d\./.test(line.trim()))
      .map(line => line.replace(/^\d\.\s*/, '').trim())
      .slice(0, 3);

    return replies.length > 0 ? replies : [
      'Thank you for your message. How can I help you?',
      'Got it! When would you like me to start?',
      'Sure, I can do that. Any specific requirements?',
    ];
  }

  // Helper: Extract section from formatted response
  private extractSection(text: string, startMarker: string, endMarker: string): string {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return '';

    const contentStart = startIndex + startMarker.length;
    
    if (!endMarker) {
      return text.substring(contentStart).trim();
    }

    const endIndex = text.indexOf(endMarker, contentStart);
    if (endIndex === -1) {
      return text.substring(contentStart).trim();
    }

    return text.substring(contentStart, endIndex).trim();
  }

  // Validate response length (safety check)
  private validateResponse(text: string): string {
    const words = text.split(/\s+/).length;
    if (words > GEMINI_CONFIG.MAX_RESPONSE_LENGTH) {
      // Truncate to max length
      return text.split(/\s+/).slice(0, GEMINI_CONFIG.MAX_RESPONSE_LENGTH).join(' ') + '...';
    }
    return text;
  }
}

export const aiService = new AIService();
export type { DealRequestSuggestion, SearchSuggestion, ReplySuggestion };
