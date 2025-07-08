import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface BlogGenerationRequest {
  topic: string;
  sourceUrl?: string;
  sourceFile?: string;
  comparison?: string;
  requirements: string;
}

export interface BlogContent {
  title: string;
  content: string;
}

export interface DerivativeContent {
  englishBlog: BlogContent;
  threads: string[];
  tweets: string[];
}

export async function generateKoreanBlog(request: BlogGenerationRequest): Promise<BlogContent> {
  const prompt = `
자동차 시장 분석 전문가로서 다음 정보를 바탕으로 전문적인 한글 블로그 포스트를 작성해주세요.

주제: ${request.topic}
${request.sourceUrl ? `참고 URL: ${request.sourceUrl}` : ''}
${request.comparison ? `비교 분석 대상: ${request.comparison}` : ''}
요청사항: ${request.requirements}

다음 형식으로 응답해주세요:
- 제목은 SEO에 최적화되고 흥미를 끄는 형태로 작성
- 본문은 HTML 형식으로 작성 (h2, h3, p, table, ul, ol 태그 사용)
- 데이터가 있다면 HTML 테이블로 구성
- 전문적이면서도 읽기 쉬운 톤으로 작성
- 2000-3000자 분량

JSON 형식으로 응답해주세요: {"title": "제목", "content": "HTML 형식의 본문"}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "당신은 자동차 산업 분석 전문가입니다. 전문적이고 신뢰할 수 있는 콘텐츠를 작성합니다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      title: result.title || '제목 없음',
      content: result.content || '내용이 생성되지 않았습니다.'
    };
  } catch (error) {
    throw new Error(`Korean blog generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateDerivativeContent(koreanBlog: BlogContent): Promise<DerivativeContent> {
  const prompt = `
다음 한글 블로그 포스트를 바탕으로 3가지 파생 콘텐츠를 생성해주세요:

제목: ${koreanBlog.title}
내용: ${koreanBlog.content}

다음과 같이 생성해주세요:
1. 영문 블로그: 한글 블로그를 영어로 번역하되, 서구 독자에게 맞게 조정
2. 스레드 포스트: 4개의 연속된 포스트로 분할 (각 280자 이내)
3. 트위터 포스트: 4개의 독립적인 트윗 (각 280자 이내, 해시태그 포함)

JSON 형식으로 응답해주세요:
{
  "englishBlog": {"title": "영문 제목", "content": "HTML 형식의 영문 본문"},
  "threads": ["포스트1", "포스트2", "포스트3", "포스트4"],
  "tweets": ["트윗1", "트윗2", "트윗3", "트윗4"]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "당신은 다국어 콘텐츠 전문가입니다. 원본의 의미를 유지하면서 각 플랫폼에 최적화된 콘텐츠를 생성합니다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      englishBlog: result.englishBlog || { title: 'No Title', content: 'No Content' },
      threads: result.threads || ['Thread content not generated'],
      tweets: result.tweets || ['Tweet content not generated']
    };
  } catch (error) {
    throw new Error(`Derivative content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
