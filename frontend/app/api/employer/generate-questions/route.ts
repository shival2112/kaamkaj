import { NextRequest, NextResponse } from 'next/server';

function mockQuestions(round: string, jobTitle: string) {
  return [
    { question: `Tell me about your background and what draws you to this ${jobTitle} role.`, category: 'HR', difficulty: 'Easy' },
    { question: `Describe a challenging project you led and what the outcome was.`, category: 'Behavioral', difficulty: 'Medium' },
    { question: `How do you approach debugging a complex issue under pressure?`, category: 'Technical', difficulty: 'Medium' },
    { question: `Walk me through how you prioritise competing deadlines.`, category: 'Behavioral', difficulty: 'Hard' },
    { question: `What does success look like for you in this ${round}?`, category: 'HR', difficulty: 'Easy' },
    { question: `Where do you see your skills evolving over the next two years?`, category: 'HR', difficulty: 'Medium' },
  ];
}

export async function POST(req: NextRequest) {
  const { round, jobTitle, skills } = (await req.json()) as {
    round: string;
    jobTitle: string;
    skills: string[];
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(mockQuestions(round, jobTitle));
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        messages: [
          {
            role: 'user',
            content: `Generate 6 interview questions for a ${round} interview for the role of ${jobTitle} requiring skills: ${skills.join(', ')}. Return ONLY a JSON array with no extra text or markdown: [{"question":"...","category":"Technical/HR/Behavioral","difficulty":"Easy/Medium/Hard"}]`,
          },
        ],
      }),
    });

    if (!res.ok) throw new Error('upstream error');

    const data = (await res.json()) as {
      content: { type: string; text: string }[];
    };
    const raw = data.content[0].text.trim();
    const questions = JSON.parse(raw);
    return NextResponse.json(questions);
  } catch {
    return NextResponse.json(mockQuestions(round, jobTitle));
  }
}
