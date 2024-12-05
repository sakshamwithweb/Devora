import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(params) {
    try {
        const { message } = await params.json()
        console.log(message)
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: message,
                },
            ],
        });
        return NextResponse.json({ response: completion.choices[0].message.content, success: true })
    } catch (error) {
        console.log(error.message)
        return NextResponse.json({ success: false })
    }
}