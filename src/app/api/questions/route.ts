import { NextResponse } from "next/server";

import { publicQuestions } from "@/data/questions";

export function GET() {
  return NextResponse.json(publicQuestions);
}
