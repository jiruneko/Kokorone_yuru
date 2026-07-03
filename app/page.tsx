"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Character = {
  id: string;
  slug: string;
  name: string;
  role: string;
  description: string;
  tone: string;
  system_prompt: string;
  emoji: string | null;
};

type Category = {
  id: string;
  label: string;
  description: string;
};

type ConsultationLog = {
  id: number;
  characterName: string;
  categoryLabel: string;
  message: string;
  answer: string;
  createdAt: string;
};

const categories: Category[] = [
  {
    id: "relationship",
    label: "人間関係",
    description: "友人、家族、職場、学校などの悩み",
  },
  {
    id: "school-work",
    label: "学校・仕事",
    description: "通学、通勤、勉強、仕事、将来の不安",
  },
  {
    id: "mental",
    label: "こころの不調",
    description: "不安、落ち込み、孤独感、疲れやすさ",
  },
  {
    id: "life",
    label: "生活の困りごと",
    description: "睡眠、生活リズム、お金、居場所の不安",
  },
];

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0].id);
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [isCharactersLoading, setIsCharactersLoading] = useState(true);
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const [dbError, setDbError] = useState("");
  const [logs, setLogs] = useState<ConsultationLog[]>([]);

  useEffect(() => {
    const fetchCharacters = async () => {
      setIsCharactersLoading(true);
      setDbError("");

      const { data, error } = await supabase
        .from("characters")
        .select("id, slug, name, role, description, tone, system_prompt, emoji")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
        setDbError(
          "キャラクターの読み込みに失敗しました。Supabaseの設定を確認してください。"
        );
        setIsCharactersLoading(false);
        return;
      }

      const fetchedCharacters = data ?? [];

      setCharacters(fetchedCharacters);

      if (fetchedCharacters.length > 0) {
        setSelectedCharacterId(fetchedCharacters[0].id);
      }

      setIsCharactersLoading(false);
    };

    fetchCharacters();
  }, []);

  const selectedCharacter = useMemo(() => {
    return (
      characters.find((character) => character.id === selectedCharacterId) ??
      null
    );
  }, [characters, selectedCharacterId]);

  const selectedCategory = useMemo(() => {
    return (
      categories.find((category) => category.id === selectedCategoryId) ??
      categories[0]
    );
  }, [selectedCategoryId]);

  const handleSubmit = async () => {
    if (!message.trim() || !selectedCharacter) return;

    setIsAnswerLoading(true);
    setAnswer("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          characterName: selectedCharacter.name,
          characterRole: selectedCharacter.role,
          characterTone: selectedCharacter.tone,
          systemPrompt: selectedCharacter.system_prompt,
          categoryLabel: selectedCategory.label,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "AI返答の取得に失敗しました。");
      }

      const newAnswer = data.answer as string;

      setAnswer(newAnswer);

      const newLog: ConsultationLog = {
        id: Date.now(),
        characterName: selectedCharacter.name,
        categoryLabel: selectedCategory.label,
        message,
        answer: newAnswer,
        createdAt: new Date().toLocaleString("ja-JP"),
      };

      setLogs((currentLogs) => [newLog, ...currentLogs]);
    } catch (error) {
      console.error(error);

      setAnswer(
        "すみません。今は返答を作る途中でエラーが起きました。少し時間を置いて、もう一度試してください。"
      );
    } finally {
      setIsAnswerLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-cyan-50 px-4 py-8 text-slate-800">
      <div className="mx-auto max-w-6xl">
        <section className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-[2rem] bg-white/80 p-6 shadow-sm ring-1 ring-sky-100">
              <Image
                src="/Kokorone.png"
                alt="Kokorone"
                width={260}
                height={260}
                priority
                className="h-auto w-52 md:w-64"
              />
            </div>
          </div>

          <p className="mb-3 text-sm font-bold tracking-[0.3em] text-sky-500">
            KOKORONE
          </p>

          <h1 className="mb-5 text-4xl font-bold tracking-tight text-slate-800 md:text-5xl">
            こころの声を、
            <br className="md:hidden" />
            話しやすい相手に。
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-8 text-slate-600">
            Kokoroneは、相談する相手を自分で選べるこころの相談アプリです。
            その日の気持ちに合わせて、話しやすい相手を選んでください。
          </p>
        </section>

        <section className="mb-8 rounded-[2rem] bg-white/90 p-6 shadow-sm ring-1 ring-sky-100 md:p-8">
          <div className="mb-6">
            <p className="mb-2 text-sm font-bold text-sky-500">STEP 1</p>
            <h2 className="text-2xl font-bold">相談する相手を選ぶ</h2>
          </div>

          {isCharactersLoading ? (
            <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
              キャラクターを読み込んでいます...
            </p>
          ) : dbError ? (
            <p className="rounded-2xl bg-red-50 p-5 text-sm leading-7 text-red-600">
              {dbError}
            </p>
          ) : characters.length === 0 ? (
            <p className="rounded-2xl bg-amber-50 p-5 text-sm leading-7 text-amber-700">
              キャラクターが登録されていません。Supabaseのcharactersテーブルにデータを追加してください。
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {characters.map((character) => {
                const isSelected = character.id === selectedCharacterId;

                return (
                  <button
                    key={character.id}
                    onClick={() => {
                      setSelectedCharacterId(character.id);
                      setAnswer("");
                    }}
                    className={`rounded-[1.5rem] border p-5 text-left transition hover:-translate-y-1 hover:shadow-md ${
                      isSelected
                        ? "border-sky-400 bg-sky-50 shadow-md ring-4 ring-sky-100"
                        : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/60"
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-4xl">{character.emoji ?? "💙"}</div>

                      {isSelected && (
                        <span className="rounded-full bg-sky-500 px-3 py-1 text-xs font-bold text-white">
                          選択中
                        </span>
                      )}
                    </div>

                    <h3 className="mb-2 text-lg font-bold text-slate-800">
                      {character.name}
                    </h3>

                    <p className="mb-3 text-sm font-bold text-sky-600">
                      {character.role}
                    </p>

                    <p className="text-sm leading-6 text-slate-600">
                      {character.description}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="mb-8 rounded-[2rem] bg-white/90 p-6 shadow-sm ring-1 ring-sky-100 md:p-8">
          <div className="mb-6">
            <p className="mb-2 text-sm font-bold text-sky-500">STEP 2</p>
            <h2 className="text-2xl font-bold">相談の種類を選ぶ</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {categories.map((category) => {
              const isSelected = category.id === selectedCategoryId;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setAnswer("");
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-sky-400 bg-sky-50 shadow-sm ring-4 ring-sky-100"
                      : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/60"
                  }`}
                >
                  <p className="mb-2 font-bold text-slate-800">
                    {category.label}
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    {category.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] bg-white/90 p-6 shadow-sm ring-1 ring-sky-100 md:p-8">
            <div className="mb-5">
              <p className="mb-2 text-sm font-bold text-sky-500">STEP 3</p>
              <h2 className="text-2xl font-bold">相談してみる</h2>
            </div>

            <div className="mb-4 rounded-2xl bg-sky-50 p-4 text-sm leading-7 text-slate-600">
              <p>
                今選んでいる相手：
                <span className="font-bold text-slate-800">
                  {selectedCharacter?.name ?? "未選択"}
                </span>
              </p>
              <p>
                相談の種類：
                <span className="font-bold text-slate-800">
                  {selectedCategory.label}
                </span>
              </p>
            </div>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="今、困っていることや、誰かに聞いてほしいことを書いてください。例：最近、人と話すのが怖いです。どうしたらいいかわかりません。"
              className="mb-4 min-h-56 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 leading-7 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />

            <button
              onClick={handleSubmit}
              disabled={!message.trim() || isAnswerLoading || !selectedCharacter}
              className="w-full rounded-2xl bg-sky-500 px-6 py-4 font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isAnswerLoading ? "返答を考えています..." : "この相手に相談する"}
            </button>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-800">
              Kokoroneは医療診断を行うものではありません。自分や誰かを傷つけそうなほど苦しい場合は、今すぐ身近な人、地域の相談窓口、緊急窓口につながってください。
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/90 p-6 shadow-sm ring-1 ring-sky-100 md:p-8">
            <div className="mb-5">
              <p className="mb-2 text-sm font-bold text-sky-500">STEP 4</p>
              <h2 className="text-2xl font-bold">返答</h2>
            </div>

            {isAnswerLoading ? (
              <div className="rounded-2xl bg-sky-50 p-5 leading-8 text-slate-500 ring-1 ring-sky-100">
                {selectedCharacter?.name ?? "Kokorone"}
                が、あなたの言葉を受け止めています。
              </div>
            ) : answer ? (
              <div className="whitespace-pre-wrap rounded-2xl bg-gradient-to-b from-sky-50 to-white p-5 leading-8 text-slate-700 ring-1 ring-sky-100">
                {answer}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-5 leading-8 text-slate-500 ring-1 ring-slate-100">
                相談を送ると、ここに返答が表示されます。
                <br />
                まずは短い言葉でも大丈夫です。
              </div>
            )}

            {selectedCharacter && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                <p className="mb-1 font-bold text-slate-800">
                  {selectedCharacter.emoji ?? "💙"} {selectedCharacter.name}
                </p>
                <p>口調：{selectedCharacter.tone}</p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white/90 p-6 shadow-sm ring-1 ring-sky-100 md:p-8">
          <div className="mb-5">
            <p className="mb-2 text-sm font-bold text-sky-500">HISTORY</p>
            <h2 className="text-2xl font-bold">今回の相談履歴</h2>
          </div>

          {logs.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-500">
              まだ相談履歴はありません。相談すると、ここに一時的に表示されます。
            </p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <article
                  key={log.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="mb-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-sky-50 px-3 py-1 font-bold text-sky-600">
                      {log.characterName}
                    </span>
                    <span className="rounded-full bg-cyan-50 px-3 py-1 font-bold text-cyan-600">
                      {log.categoryLabel}
                    </span>
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-500">
                      {log.createdAt}
                    </span>
                  </div>

                  <p className="mb-3 text-sm font-bold text-slate-800">
                    相談内容
                  </p>

                  <p className="mb-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                    {log.message}
                  </p>

                  <p className="mb-3 text-sm font-bold text-slate-800">返答</p>

                  <p className="whitespace-pre-wrap rounded-xl bg-sky-50 p-4 text-sm leading-7 text-slate-600">
                    {log.answer}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}