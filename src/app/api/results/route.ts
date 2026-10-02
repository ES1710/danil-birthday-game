import { NextRequest, NextResponse } from "next/server";

import { questions } from "@/data/questions";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type SubmittedAnswer = {
  questionId?: unknown;
  selectedIndex?: unknown;
};

function normalizedName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function unavailableResponse() {
  return NextResponse.json(
    { error: "Таблица результатов ещё не подключена. Настройте Supabase по инструкции в README.md." },
    { status: 503 },
  );
}

export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return unavailableResponse();
  }

  const requestedName = request.nextUrl.searchParams.get("name");

  if (requestedName !== null) {
    const name = normalizedName(requestedName);

    if (name.length < 2 || name.length > 30) {
      return NextResponse.json({ error: "Имя должно содержать от 2 до 30 символов." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("quiz_results")
      .select("id")
      .eq("name_key", name.toLocaleLowerCase("ru-RU"))
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Не удалось проверить имя." }, { status: 500 });
    }

    return NextResponse.json({ available: data === null });
  }

  const { data, error } = await supabase
    .from("quiz_results")
    .select("name, score, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Не удалось загрузить таблицу результатов." }, { status: 500 });
  }

  let lastScore: number | null = null;
  let lastPlace = 0;
  const leaderboard = (data ?? []).map((item, index) => {
    if (item.score !== lastScore) {
      lastPlace = index + 1;
      lastScore = item.score;
    }

    return {
      place: lastPlace,
      name: item.name,
      score: item.score,
    };
  });

  return NextResponse.json(leaderboard);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return unavailableResponse();
  }

  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    answers?: unknown;
  } | null;

  const name = typeof body?.name === "string" ? normalizedName(body.name) : "";
  const rawAnswers = Array.isArray(body?.answers) ? (body.answers as SubmittedAnswer[]) : [];

  if (name.length < 2 || name.length > 30) {
    return NextResponse.json({ error: "Имя должно содержать от 2 до 30 символов." }, { status: 400 });
  }

  const answers = new Map<number, number>();

  for (const answer of rawAnswers) {
    if (!Number.isInteger(answer.questionId) || !Number.isInteger(answer.selectedIndex)) {
      return NextResponse.json({ error: "Получены некорректные ответы." }, { status: 400 });
    }

    const questionId = answer.questionId as number;
    const selectedIndex = answer.selectedIndex as number;

    if (answers.has(questionId)) {
      return NextResponse.json({ error: "Один вопрос передан несколько раз." }, { status: 400 });
    }

    answers.set(questionId, selectedIndex);
  }

  const allAnswersAreValid =
    answers.size === questions.length &&
    questions.every((question) => {
      const selectedIndex = answers.get(question.id);
      return selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < question.options.length;
    });

  if (!allAnswersAreValid) {
    return NextResponse.json({ error: "Нужно ответить на все 15 вопросов." }, { status: 400 });
  }

  const score = questions.reduce(
    (total, question) => total + (answers.get(question.id) === question.correctIndex ? 1 : 0),
    0,
  );

  const { error } = await supabase.from("quiz_results").insert({ name, score });

  if (error?.code === "23505") {
    return NextResponse.json(
      { error: "Это имя уже занято. Выберите другое имя." },
      { status: 409 },
    );
  }

  if (error) {
    return NextResponse.json({ error: "Не удалось сохранить результат." }, { status: 500 });
  }

  return NextResponse.json({ score });
}
