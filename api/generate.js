export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { topic, category, duration, tone, channelInfo, apiKey } = req.body;

  const prompt = `당신은 2026년 대한민국 유튜브 알고리즘과 트렌드에 정통한 최고의 콘텐츠 전략가입니다. 아래 조건에 맞는 콘텐츠를 JSON 형식으로만 출력하세요. 마크다운 코드블록 없이 순수 JSON만 반환하세요.

조건:
- 주제: ${topic}
- 카테고리: ${category}
- 영상 길이: ${duration}
- 톤: ${tone}
${channelInfo ? `- 채널 정보: ${channelInfo}` : ''}

=== 2026 트렌드 및 후킹 전략 필수 적용 ===

[제목 작성 규칙]
1. 숫자의 법칙: 홀수(3,5,7) 우선 사용. "5가지", "7초만에", "3번만 하면" 등
2. 궁금증 유발: "이걸 모르면", "아직도 모름?", "사실은..." 등 정보 갭 활용
3. 손실 회피 심리: "안 하면 손해", "이미 늦었을 수도", "XX하는 사람만 앎" 등
4. 2026 밈 자연스럽게 활용: "레전드", "실화냐", "역대급", "찐으로", "개꿀", "ㄹㅇ로" 등
5. 숫자+감정 조합: "딱 3분인데 인생 바뀜", "5만명이 검색한" 등
6. 핵심 키워드를 제목 앞부분에 배치

[스크립트 후킹 전략]
- 오프닝 첫 3초: 충격적 사실/통계/질문으로 시작. "여러분 혹시 알고 계셨나요?" 금지. 대신 충격 팩트나 "XX하는 사람 손!" 으로 시작
- 패턴 인터럽트: 중간중간 "잠깐, 여기서 핵심!" 등으로 집중도 유지
- 루프 걸기: 오프닝에 "마지막에 꿀팁 하나 더 드릴게요" 등 끝까지 보게 만들기
- 공감 언어: "저도 처음엔 몰랐는데요", "이거 진짜 저만 알고 싶었어요" 등
- 마무리 CTA: 구독/좋아요 유도를 자연스럽게 스토리에 녹이기

[썸네일 문구 전략]
- 최대 10자 이내 임팩트
- 숫자 포함 필수
- "충격", "레전드", "실화", "ㄹㅇ" 등 감정 자극 단어 사용

아래 JSON 구조로 정확히 반환하세요:
{
  "script": "【오프닝 - 첫 3초 후킹】\\n(충격 팩트나 질문으로 시작)\\n\\n【본론 - 핵심 내용】\\n(번호 매겨서 구조화, 패턴 인터럽트 포함)\\n\\n【마무리 - CTA】\\n(자연스러운 구독 유도)",
  "titles": "1. (숫자+후킹 제목)\\n2. (궁금증 유발 제목)\\n3. (손실 회피 제목)\\n4. (밈/트렌드 활용 제목)\\n5. (검색 최적화 제목)",
  "thumbnail": "(10자 이내 임팩트 문구)\\n(숫자 포함 문구)\\n(감정 자극 문구)"
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
