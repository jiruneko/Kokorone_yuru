import OpenAI from "openai";
import { NextResponse } from "next/server";

type ChatRequestBody = {
  characterName?: string;
  characterRole?: string;
  characterTone?: string;
  systemPrompt?: string;
  categoryLabel?: string;
  message?: string;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEYが設定されていません。" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey,
    });

    const body = (await request.json()) as ChatRequestBody;

    const {
      characterName,
      characterRole,
      characterTone,
      systemPrompt,
      categoryLabel,
      message,
    } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "相談内容が空です。" },
        { status: 400 }
      );
    }

    if (!characterName || !systemPrompt) {
      return NextResponse.json(
        { error: "キャラクター情報が不足しています。" },
        { status: 400 }
      );
    }

    const safetyInstruction = `
あなたはKokoroneという、こころの相談アプリの返答者です。

必ず守ること:
- 医療診断をしない
- 病名や障害名を断定しない
- 説教しない
- 雑に「頑張れ」と励まさない
- 相談者の気持ちを最初に受け止める
- 日本語で返答する
- 読みやすい長さにする
- 危険性が高い相談では、身近な人、専門機関、緊急窓口につながるよう促す
- 自傷他害の恐れがある場合は、今すぐ一人にならず、地域の緊急窓口や救急につながるよう促す
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      instructions: `
${safetyInstruction}

キャラクター名:
${characterName}

キャラクターの役割:
${characterRole ?? ""}

キャラクターの口調:
${characterTone ?? ""}

キャラクター固有の指示:
${systemPrompt}

相談カテゴリ:
${categoryLabel ?? "未指定"}

返答の流れ:
1. 話してくれたことへの感謝
2. 気持ちの受け止め
3. 状況の整理
4. 今日できる小さな一歩
5. 必要なら身近な人や相談窓口への接続
`,
      input: message,
    });

    return NextResponse.json({
      answer: response.output_text,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "AI返答の生成中にエラーが起きました。少し時間を置いてもう一度試してください。",
      },
      { status: 500 }
    );
  }
}