import type { ChatHistory, Part, GeminiProxyResponse } from "../types";

/**
 * يرسل سجل المحادثة إلى الخادم الوكيل الآمن.
 * @param history سجل المحادثة الحالي.
 * @param newMessage الرسالة الجديدة من المستخدم.
 * @param functionResponses استجابات دالة اختيارية لإرسالها مرة أخرى إلى النموذج.
 * @returns وعد يتم حله بالاستجابة المجهزة من الخادم الوكيل.
 */
export const sendMessageToGemini = async (
  history: ChatHistory,
  newMessage: string,
  functionResponses?: Part[]
): Promise<GeminiProxyResponse> => {
    
    // =================================================================================
    // !!! خطوة حاسمة - يجب تعديل هذا الرابط !!!
    // =================================================================================
    // بعد نشر مجلد `proxy-server` على Vercel، ستحصل على رابط فريد.
    // استبدل `'https://YOUR_VERCEL_DEPLOYMENT_URL'` بهذا الرابط.
    // يجب أن يبدو الرابط النهائي هكذا: 'https://your-project-name.vercel.app/api/proxy'
    //
    // **لن يعمل التطبيق بشكل صحيح حتى تقوم بتحديث هذا الرابط.**
    // =================================================================================
    const PROXY_URL = 'https://YOUR_VERCEL_DEPLOYMENT_URL/api/proxy';

    const bodyPayload: { contents: ChatHistory, function_responses?: Part[] } = {
        contents: [...history]
    };
    
    if (functionResponses) {
        bodyPayload.function_responses = functionResponses;
    }

    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Invalid JSON response from server' }));
        console.error("Error from proxy server:", errorData);
        throw new Error(errorData.details || errorData.error || `Failed to fetch from proxy with status: ${response.status}`);
    }

    const geminiResponse: GeminiProxyResponse = await response.json();
    return geminiResponse;
};