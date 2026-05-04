import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const fileContents = fs.readFileSync(dbPath, 'utf8');
    const todos = JSON.parse(fileContents);
    
    const todoIndex = todos.findIndex((t: any) => t.id === id);
    if (todoIndex === -1) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    todos[todoIndex] = { ...todos[todoIndex], ...body };
    fs.writeFileSync(dbPath, JSON.stringify(todos, null, 2));

    return NextResponse.json(todos[todoIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const fileContents = fs.readFileSync(dbPath, 'utf8');
    let todos = JSON.parse(fileContents);
    
    const todoIndex = todos.findIndex((t: any) => t.id === id);
    if (todoIndex === -1) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    // Intentional Error: trying to use a non-existent function on the array
    // This will throw a TypeError: todos.remove is not a function
    // @ts-ignore
    todos.remove(todoIndex); 

    fs.writeFileSync(dbPath, JSON.stringify(todos, null, 2));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Intentional Error Triggered:", error.message);
    return NextResponse.json({ error: 'Server Error: ' + error.message }, { status: 500 });
  }
}
