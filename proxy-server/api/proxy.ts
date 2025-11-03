import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// تعريف الدوال التي يمكن للنموذج استدعاؤها
const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'saveUserData',
    parameters: {
      type: Type.OBJECT,
      description: 'يحفظ معلومة واحدة عن المستخدم باستخدام مفتاح وقيمة. استخدمه عندما يطلب منك المستخدم صراحة أن تتذكر شيئًا ما.',
      properties: {
        key: { type: Type.STRING, description: 'المفتاح الذي سيتم حفظ المعلومة تحته. يجب أن يكون بسيطاً وواضحاً، مثل "تاريخ الميلاد" أو "اسم حيوان أليف".' },
        value: { type: Type.STRING, description: 'المعلومة الفعلية التي سيتم حفظها.' },
      },
      required: ['key', 'value'],
    },
  },
  {
    name: 'getUserData',
    parameters: {
      type: Type.OBJECT,
      description: 'يسترجع معلومة واحدة محفوظة مسبقاً عن المستخدم باستخدام مفتاحها.',
      properties: {
        key: { type: Type.STRING, description: 'المفتاح الذي تريد البحث عن معلومته.' },
      },
      required: ['key'],
    },
  },
  {
      name: 'getAllUserData',
      parameters: {
          type: Type.OBJECT,
          description: 'يسترجع جميع المعلومات المحفوظة عن المستخدم ككائن JSON. استخدمه للحصول على نظرة عامة على ذاكرة المستخدم أو عند بدء محادثة جديدة.',
          properties: {},
          required: [],
      }
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // السماح بالطلبات من أي مصدر (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // التأكد من وجود مفتاح API
  if (!process.env.API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const { contents, function_responses } = req.body;

    if (!contents) {
      return res.status(400).json({ error: 'Missing "contents" in request body' });
    }
    
    const requestContents = [...contents];
    if(function_responses) {
        requestContents.push({ role: 'function', parts: function_responses });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: requestContents,
      config: {
        tools: [{ functionDeclarations }],
      },
    });

    const responseText = response.text;
    const functionCalls = response.functionCalls;
    
    // إرسال الاستجابة مرة أخرى إلى العميل
    res.status(200).json({
      text: responseText,
      functionCalls: functionCalls,
    });
  } catch (error) {
    console.error('--- ERROR IN GEMINI PROXY ---');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Request Body:', JSON.stringify(req.body, null, 2));
    console.error('Error Object:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ 
        error: 'An error occurred while communicating with the Gemini API.', 
        details: errorMessage 
    });
  }
}