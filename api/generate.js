export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { topic, category, duration, tone, channelInfo, apiKey } = req.body;

  const prompt = `당신은 유튜브 콘텐츠 전문가입니다. 아래 조건에 맞는 콘텐츠를 JSON 형식으로만 출력하세요. 마크다운 코드블록 없이 순수 JSON만 반환하세요.

조건:
- 주제: ${topic}
- 카테고리: ${category}
- 영상 길이: ${duration}
- 톤: ${tone}
${channelInfo ? `- 채널 정보: ${channelInfo}` : ''}

아래 JSON 구조로 정확히 반환하세요:
{
  "script": "오프닝 → 본론 → 마무리 구조의 스크립트. 자연스러운 구어체로 실제 말하듯이 작성. 섹션별로 줄바꿈 구분.",
  "titles": "1. 제목1\\n2. 제목2\\n3. 제목3\\n4. 제목4\\n5. 제목5",
  "thumbnail": "썸네일 문구 3가지 (각 줄에 하나씩, 임팩트 있고 짧게)"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });

    const text = data.content.map(i => i.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
