import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Initialize Gemini 1.5 Flash (for speed and vision)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert academic document parser. 
      Analyze the attached marksheet/document and extract the following information into a clean JSON format:
      {
        "studentName": "Full name of the student",
        "board": "Education board (e.g., CBSE, ICSE, State Board)",
        "year": "Passing/Completion year",
        "score": "Percentage or CGPA (e.g., 88.5%)"
      }
      Only return the JSON object, nothing else. If you cannot find a value, use "N/A".
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image.split(',')[1],
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean the text if it contains markdown code blocks
    const jsonString = text.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(jsonString);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Image parsing failed:', error);
    return NextResponse.json({ error: 'Failed to parse document' }, { status: 500 });
  }
}
