import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

export async function GET() {
  try {
    const fileContents = fs.readFileSync(dbPath, 'utf8');
    const todos = JSON.parse(fileContents);
    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const fileContents = fs.readFileSync(dbPath, 'utf8');
    const todos = JSON.parse(fileContents);

    const newTodo = {
      id: Date.now().toString(),
      text: body.text,
      completed: false,
    };

    todos.push(newTodo);
    fs.writeFileSync(dbPath, JSON.stringify(todos, null, 2));

    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}
