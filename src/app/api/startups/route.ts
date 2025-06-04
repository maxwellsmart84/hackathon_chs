import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, startups } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { StartupProfileSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user first to verify they exist and are a startup
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.userType !== "startup") {
      return NextResponse.json({ error: "Access denied - not a startup user" }, { status: 403 });
    }

    // Get startup profile
    const startup = await db.query.startups.findFirst({
      where: eq(startups.userId, user.id),
    });

    if (!startup) {
      return NextResponse.json({ error: "Startup profile not found" }, { status: 404 });
    }

    return NextResponse.json({ startup });
  } catch (error) {
    console.error("Error fetching startup:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user first to verify they exist and are a startup
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.userType !== "startup") {
      return NextResponse.json({ error: "Access denied - not a startup user" }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate the startup profile data
    const validatedData = StartupProfileSchema.parse(body);

    // Check if startup profile already exists
    const existingStartup = await db.query.startups.findFirst({
      where: eq(startups.userId, user.id),
    });

    if (existingStartup) {
      return NextResponse.json({ error: "Startup profile already exists" }, { status: 409 });
    }

    // Create startup profile
    const newStartup = await db.insert(startups).values({
      id: crypto.randomUUID(),
      userId: user.id,
      ...validatedData,
    });

    // Update user profile completion status
    await db.update(users)
      .set({ 
        profileComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json(
      { message: "Startup profile created successfully", startupId: newStartup.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating startup profile:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user first to verify they exist and are a startup
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.userType !== "startup") {
      return NextResponse.json({ error: "Access denied - not a startup user" }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate the updated data
    const validatedData = StartupProfileSchema.partial().parse(body);

    // Update startup profile
    await db.update(startups)
      .set({ 
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(startups.userId, user.id));

    return NextResponse.json({ message: "Startup profile updated successfully" });
  } catch (error) {
    console.error("Error updating startup profile:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 