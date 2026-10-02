import { NextRequest, NextResponse } from "next/server";

import { questions } from "@/data/questions";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    questionId?: unknown;
    selectedIndex?: unknown;
  } | null;

  if (
    !body ||
    !Number.isInteger(body.questionId) ||
    !Number.isInteger(body.selectedIndex)
  ) {
    return NextResponse.json({ error: "Некорректный ответ." }, { status: 400 });
  }

  const questionId = body.questionId as number;
  const selectedIndex = body.selectedIndex as number;
  const question = questions.find((item) => item.id === questionId);

  if (!question || selectedIndex < 0 || selectedIndex >= question.options.length) {
    return NextResponse.json({ error: "Вопрос или вариант ответа не найден." }, { status: 400 });
  }

  return NextResponse.json({
    correctIndex: question.correctIndex,
    isCorrect: selectedIndex === question.correctIndex,
  });
}
