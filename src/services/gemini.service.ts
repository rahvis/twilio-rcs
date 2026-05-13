import { GoogleGenAI } from '@google/genai';
import { getConfig } from '../config/environment';
import logger from '../utils/logger';

class GeminiService {
  private client?: GoogleGenAI;
  private readonly model: string;

  constructor() {
    const config = getConfig();
    this.model = config.GEMINI_MODEL;

    if (config.GEMINI_API_KEY) {
      this.client = new GoogleGenAI({
        apiKey: config.GEMINI_API_KEY
      });
    }

    logger.info('Gemini service initialized', {
      model: this.model,
      configured: !!this.client
    });
  }

  isConfigured(): boolean {
    return !!this.client;
  }

  getModel(): string {
    return this.model;
  }

  /**
   * Optional constrained generation hook.
   * The RCS webhook does not call this for consent or action routing.
   */
  async generateConstrainedText(
    prompt: string,
    systemInstruction: string
  ): Promise<string> {
    if (!this.client) {
      throw new Error('GEMINI_API_KEY is required to call Gemini');
    }

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response from Gemini');
    }

    return text.trim();
  }
}

export default new GeminiService();
