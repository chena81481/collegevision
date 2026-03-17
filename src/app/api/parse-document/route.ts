import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Get Auth User
    const authHeader = req.headers.get('Authorization') || '';
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    // Initialize Gemini 1.5 Flash (for speed and vision)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert academic document parser for Indian educational documents (CBSE, ICSE, etc.). 
      Analyze the attached marksheet/document and extract the following information into a clean JSON format:
      {
        "studentName": "Full name of the student",
        "board": "Education board or University name",
        "year": "Passing year as number (e.g. 2022)",
        "score": "Percentage or CGPA as number (e.g. 88.5)",
        "degreeType": "10th", "12th", "Bachelors", or "Masters",
        "specialization": "e.g. Science, Commerce, Finance, or null"
      }
      Only return the JSON object, nothing else. Use null if not found.
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
    
    // Clean the text
    const jsonString = text.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(jsonString);

    // Persistence: If user is logged in, sync to student_profiles
    if (user) {
      await supabase
        .from('student_profiles')
        .upsert({
          user_id: user.id,
          full_name: parsedData.studentName,
          highest_degree: parsedData.degreeType,
          specialization: parsedData.specialization,
          institution_name: parsedData.board,
          passing_year: parseInt(parsedData.year) || null,
          score_percentage: parseFloat(parsedData.score) || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
      // Also log the document
      await supabase
        .from('student_documents')
        .insert({
          user_id: user.id,
          file_name: `Verification_${parsedData.degreeType}_${Date.now()}.jpg`,
          file_url: 'internal://stored_temp', // Placeholder for actual storage bucket logic
          document_type: parsedData.degreeType,
          ocr_metadata: parsedData
        });
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Image parsing failed:', error);
    return NextResponse.json({ error: 'Failed to parse document' }, { status: 500 });
  }
}
